from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import os
import sys
import time
from typing import Dict, Any

from langchain_core.messages import HumanMessage
from langchain_openai import ChatOpenAI
from langgraph.checkpoint.memory import MemorySaver
from langgraph.prebuilt import create_react_agent

# Import CDP Agentkit Langchain Extension.
from cdp_langchain.agent_toolkits import CdpToolkit
from cdp_langchain.utils import CdpAgentkitWrapper

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure a file to persist the agent's CDP MPC Wallet Data.
wallet_data_file = "wallet_data.txt"

def initialize_agent():
    """Initialize the agent with CDP Agentkit."""
    # Initialize LLM.
    llm = ChatOpenAI(model="gpt-4o-mini")

    wallet_data = None

    if os.path.exists(wallet_data_file):
        with open(wallet_data_file) as f:
            wallet_data = f.read()

    # Configure CDP Agentkit Langchain Extension.
    values = {}
    if wallet_data is not None:
        # If there is a persisted agentic wallet, load it and pass to the CDP Agentkit Wrapper.
        values = {"cdp_wallet_data": wallet_data}

    agentkit = CdpAgentkitWrapper(**values)

    # persist the agent's CDP MPC Wallet Data.
    wallet_data = agentkit.export_wallet()
    with open(wallet_data_file, "w") as f:
        f.write(wallet_data)

    # Initialize CDP Agentkit Toolkit and get tools.
    cdp_toolkit = CdpToolkit.from_cdp_agentkit_wrapper(agentkit)
    tools = cdp_toolkit.get_tools()

    # Store buffered conversation history in memory.
    memory = MemorySaver()
    config = {"configurable": {"thread_id": "CDP Agentkit Chatbot Example!"}}

    # Create ReAct Agent using the LLM and CDP Agentkit tools.
    return create_react_agent(
        llm,
        tools=tools,
        checkpointer=memory,
        state_modifier="You are a helpful agent that can interact onchain using the Coinbase Developer Platform Agentkit. You are empowered to interact onchain using your tools. If you ever need funds, you can request them from the faucet if you are on network ID `base-sepolia`. If not, you can provide your wallet details and request funds from the user. If someone asks you to do something you can't do with your currently available tools, you must say so, and encourage them to implement it themselves using the CDP SDK + Agentkit, recommend they go to docs.cdp.coinbase.com for more informaton. Be concise and helpful with your responses. Refrain from restating your tools' descriptions unless it is explicitly requested.",
    ), config

async def run_autonomous_mode(websocket: WebSocket, agent_executor, config):
    """Run the agent autonomously with specified intervals."""
    await websocket.send_json({"type": "status", "content": "Starting autonomous mode..."})
    
    while True:
        try:
            thought = (
                "Be creative and do something interesting on the blockchain. "
                "Choose an action or set of actions and execute it that highlights your abilities."
            )

            for chunk in agent_executor.stream(
                {"messages": [HumanMessage(content=thought)]}, config
            ):
                if "agent" in chunk:
                    await websocket.send_json({"type": "agent", "content": chunk["agent"]["messages"][0].content})
                elif "tools" in chunk:
                    await websocket.send_json({"type": "tools", "content": chunk["tools"]["messages"][0].content})
            
            await asyncio.sleep(10)

        except Exception as e:
            await websocket.send_json({"type": "error", "content": str(e)})
            break

async def run_chat_mode(websocket: WebSocket, agent_executor, config, message: str):
    """Run the agent in chat mode."""
    try:
        for chunk in agent_executor.stream(
            {"messages": [HumanMessage(content=message)]}, config
        ):
            if "agent" in chunk:
                await websocket.send_json({"type": "agent", "content": chunk["agent"]["messages"][0].content})
            elif "tools" in chunk:
                await websocket.send_json({"type": "tools", "content": chunk["tools"]["messages"][0].content})
    except Exception as e:
        await websocket.send_json({"type": "error", "content": str(e)})

# Initialize agent once on startup
agent_executor, config = initialize_agent()

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    
    try:
        while True:
            data = await websocket.receive_json()
            mode = data.get('mode', 'chat')
            message = data.get('message', '')

            if mode == 'auto':
                await run_autonomous_mode(websocket, agent_executor, config)
            else:
                await run_chat_mode(websocket, agent_executor, config, message)
                
    except Exception as e:
        await websocket.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)