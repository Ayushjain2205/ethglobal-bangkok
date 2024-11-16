from fastapi import FastAPI, WebSocket, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from dotenv import load_dotenv
from langchain_core.messages import HumanMessage
from langchain_openai import ChatOpenAI
from langgraph.checkpoint.memory import MemorySaver
from langgraph.prebuilt import create_react_agent
from cdp_langchain.agent_toolkits import CdpToolkit
from cdp_langchain.utils import CdpAgentkitWrapper
import json

# Load environment variables
load_dotenv()

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Add your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define request model
class NPCConfig(BaseModel):
    name: str
    background: str
    appearance: str
    personality: dict
    coreValues: list
    primaryAims: list
    voice: dict
    walletAddress: str
    transactionHash: str

wallet_data_file = "wallet_data.txt"
npc_config_file = "npc_config.json"

def save_npc_config(config: dict) -> bool:
    try:
        # Ensure the directory exists
        os.makedirs(os.path.dirname(npc_config_file), exist_ok=True)
        
        with open(npc_config_file, 'w') as f:
            json.dump(config, f, indent=2)
        return True
    except Exception as e:
        print(f"Error saving NPC config: {e}")
        return False

def initialize_agent():
    llm = ChatOpenAI(model="gpt-4")
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

    # Load NPC config if it exists
    npc_config = None
    if os.path.exists(npc_config_file):
        try:
            with open(npc_config_file, 'r') as f:
                npc_config = json.load(f)
        except Exception as e:
            print(f"Error loading NPC config: {e}")

    # Modify the state modifier to include NPC personality if available
    npc_personality = ""
    if npc_config:
        npc_personality = f"""
        You are an NPC with the following traits:
        - Name: {npc_config['name']}
        - Background: {npc_config['background']}
        - Risk Tolerance: {npc_config['personality']['riskTolerance']}
        - Rationality: {npc_config['personality']['rationality']}
        - Autonomy: {npc_config['personality']['autonomy']}
        - Core Values: {', '.join(npc_config['coreValues'])}
        - Primary Aims: {', '.join(npc_config['primaryAims'])}
        
        Incorporate these traits into your responses and decision-making.
        """

    state_modifier = f"""You are a helpful agent that can interact onchain using the Coinbase Developer Platform Agentkit. 
    {npc_personality}
    You are empowered to interact onchain using your tools. If you ever need funds, you can request them from the faucet if you are on network ID `base-sepolia`. 
    If not, you can provide your wallet details and request funds from the user. If someone asks you to do something you can't do with your currently available tools, 
    you must say so, and encourage them to implement it themselves using the CDP SDK + Agentkit, recommend they go to docs.cdp.coinbase.com for more informaton. 
    Be concise and helpful with your responses. Refrain from restating your tools' descriptions unless it is explicitly requested."""

    return create_react_agent(
        llm,
        tools=tools,
        checkpointer=memory,
        state_modifier=state_modifier,
    ), config

@app.post("/npc-config")
async def save_config(config: NPCConfig):
    try:
        config_dict = config.dict()
        if save_npc_config(config_dict):
            # Reinitialize agent with new config
            global agent_executor
            agent_executor, config = initialize_agent()
            return {"status": "success", "message": "NPC configuration saved and agent reinitialized"}
        raise HTTPException(status_code=500, detail="Failed to save NPC configuration")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

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
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)