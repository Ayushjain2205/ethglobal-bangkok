from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
import os
from langchain_core.messages import HumanMessage
from langchain_openai import ChatOpenAI
from langgraph.checkpoint.memory import MemorySaver
from langgraph.prebuilt import create_react_agent
from cdp_langchain.agent_toolkits import CdpToolkit
from cdp_langchain.utils import CdpAgentkitWrapper

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

wallet_data_file = "wallet_data.txt"

def initialize_agent():
    llm = ChatOpenAI(model="gpt-4o-mini")
    wallet_data = None

    if os.path.exists(wallet_data_file):
        with open(wallet_data_file) as f:
            wallet_data = f.read()

    values = {"cdp_wallet_data": wallet_data} if wallet_data else {}
    agentkit = CdpAgentkitWrapper(**values)

    wallet_data = agentkit.export_wallet()
    with open(wallet_data_file, "w") as f:
        f.write(wallet_data)

    cdp_toolkit = CdpToolkit.from_cdp_agentkit_wrapper(agentkit)
    tools = cdp_toolkit.get_tools()
    memory = MemorySaver()
    config = {"configurable": {"thread_id": "CDP Agentkit Agent"}}

    return create_react_agent(
        llm,
        tools=tools,
        checkpointer=memory,
        state_modifier="You are a helpful agent that can interact onchain using the Coinbase Developer Platform Agentkit. You are empowered to interact onchain using your tools. If you ever need funds, you can request them from the faucet if you are on network ID `base-sepolia`. If not, you can provide your wallet details and request funds from the user. If someone asks you to do something you can't do with your currently available tools, you must say so, and encourage them to implement it themselves using the CDP SDK + Agentkit, recommend they go to docs.cdp.coinbase.com for more informaton. Be concise and helpful with your responses. Refrain from restating your tools' descriptions unless it is explicitly requested.",
    ), config

agent_executor, config = initialize_agent()

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_json()
            message = data.get('message', '')
            
            for chunk in agent_executor.stream(
                {"messages": [HumanMessage(content=message)]}, 
                config
            ):
                if "agent" in chunk:
                    await websocket.send_json({"type": "agent", "content": chunk["agent"]["messages"][0].content})
                elif "tools" in chunk:
                    await websocket.send_json({"type": "tools", "content": chunk["tools"]["messages"][0].content})
    except Exception as e:
        await websocket.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)