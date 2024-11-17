from fastapi import FastAPI, WebSocket, HTTPException, WebSocketDisconnect
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
import traceback
from pathlib import Path
from typing import Optional, Literal
from datetime import datetime
from supabase import create_client, Client
from cdp import Cdp, Wallet
from web3 import Web3
from eth_account import Account


# Load environment variables
load_dotenv()


# Initialize Supabase client
supabase: Client = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_KEY")
)


# Initialize FastAPI app
app = FastAPI()


# Configure CORS
app.add_middleware(
   CORSMiddleware,
   allow_origins=["*"],  # In production, specify your frontend URL
   allow_credentials=True,
   allow_methods=["*"],
   allow_headers=["*"],
)


# Define request model
class WalletInfo(BaseModel):
    wallet_address: str
    wallet_id: str
    transaction_hash: Optional[str] = None
    network: str = "base-sepolia"
    balance: Optional[str] = "0"
    status: Literal['active', 'pending', 'inactive']

class NPCConfig(BaseModel):
    name: str
    background: str
    appearance: str
    personality: dict
    core_values: list
    primary_aims: list
    voice: dict


wallet_data_file = "wallet_data.txt"
npc_config_file = "npc_config.json"

RPC_URL = "https://base-sepolia.blockpi.network/v1/rpc/public"
CONTRACT_ADDRESS = "0xab8CF91658009e0Eb123c60bCe2120A7E13C9ff2"


def save_npc_config(config: dict) -> bool:
   try:
       # Create a Path object for better path handling
       config_path = Path(npc_config_file)
       
       # Ensure the parent directory exists
       config_path.parent.mkdir(parents=True, exist_ok=True)
       
       # Ensure avatar field exists
       if 'walletAddress' in config and not 'avatar' in config:
           config['avatar'] = f"https://api.cloudnouns.com/v1/pfp?text={config['walletAddress']}"
           
       # Write the config with better error handling
       with open(config_path, 'w', encoding='utf-8') as f:
           json.dump(config, f, indent=2, ensure_ascii=False)
       return True
   except Exception as e:
       print(f"Error saving NPC config: {str(e)}")
       print(f"Traceback: {traceback.format_exc()}")
       return False


async def create_wallet() -> dict:
   try:
       print("Initializing CDP SDK...")
       load_dotenv()
      
       # Get credentials from environment
       api_key_name = os.environ.get('CDP_API_KEY_NAME')
       api_key_private_key = os.environ.get('CDP_API_KEY_PRIVATE_KEY')
      
       if not api_key_name or not api_key_private_key:
           raise ValueError("CDP API Key Name or CDP API Key Private Key is missing")
      
       # Configure the SDK with proper key formatting
       private_key = api_key_private_key.replace('\\n', '\n')
       Cdp.configure(api_key_name, private_key)
      
       # Create a wallet - simple and straightforward
       wallet = Wallet.create()
       default_address = wallet.default_address
      
       return {
           "status": "success",
           "wallet_address": default_address.address_id,
           "wallet_id": wallet.id
       }
   except Exception as e:
       print(f"Error creating wallet: {str(e)}")
       return {
           "status": "error",
           "message": str(e)
       }


async def register_npc_domain(domain_name: str, owner_address: str) -> dict:
    try:
        private_key = os.getenv("ETH_PRIVATE_KEY")
        if not private_key:
            raise ValueError("ETH_PRIVATE_KEY not found in environment variables")

        # Connect to network
        w3 = Web3(Web3.HTTPProvider(RPC_URL))
        
        # Create account object from private key
        account = Account.from_key(private_key)
        
        # Contract ABI - only including the register function
        abi = [
            {
                "inputs": [
                    {"internalType": "string", "name": "label", "type": "string"},
                    {"internalType": "address", "name": "owner", "type": "address"}
                ],
                "name": "register",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            }
        ]
        
        # Create contract instance
        contract = w3.eth.contract(address=CONTRACT_ADDRESS, abi=abi)
        
        # Build transaction
        nonce = w3.eth.get_transaction_count(account.address)
        
        transaction = contract.functions.register(
            domain_name,
            owner_address
        ).build_transaction({
            'from': account.address,
            'nonce': nonce,
            'gas': 300000,
            'gasPrice': w3.eth.gas_price
        })
        
        # Sign transaction
        signed_txn = w3.eth.account.sign_transaction(transaction, private_key)
        
        # Send transaction
        tx_hash = w3.eth.send_raw_transaction(signed_txn.raw_transaction)
        
        # Wait for transaction receipt
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
        
        return {
            "status": "success",
            "transaction_hash": receipt['transactionHash'].hex()
        }
    except Exception as e:
        print(f"Error registering domain: {str(e)}")
        return {
            "status": "error",
            "message": str(e)
        }


@app.get("/")
async def root():
   return {"message": "API is running"}


@app.get("/test")
async def test():
   return {"message": "Test endpoint working"}


@app.get("/create-wallet")
@app.post("/create-wallet")
async def create_new_wallet():
   try:
       print("Received wallet creation request")
       wallet_data = await create_wallet()
       print(f"Wallet creation result: {wallet_data['status']}")
      
       if wallet_data["status"] == "success":
           return {
               "status": "success",
               "wallet_address": wallet_data["wallet_address"],
               "wallet_id": wallet_data["wallet_id"]
           }
       else:
           raise HTTPException(
               status_code=500,
               detail=wallet_data["message"]
           )
   except Exception as e:
       error_message = str(e)
       print(f"Error in create_new_wallet endpoint: {error_message}")
       raise HTTPException(
           status_code=500,
           detail=f"Failed to create wallet: {error_message}"
       )


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
       - Core Values: {', '.join(npc_config['core_values'])}
       - Primary Aims: {', '.join(npc_config['primary_aims'])}
      
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
       # Create wallet for the NPC
       wallet_data = await create_wallet()
       
       if wallet_data["status"] != "success":
           raise HTTPException(
               status_code=500,
               detail=f"Failed to create wallet: {wallet_data['message']}"
           )
           
       # Register domain name
       domain_name = config.name.lower().replace(" ", "-")  # Convert name to domain-friendly format
       domain_result = await register_npc_domain(domain_name, wallet_data["wallet_address"])
       
       if domain_result["status"] != "success":
           print(f"Warning: Failed to register domain: {domain_result['message']}")
           
       # Create wallet info
       wallet_info = WalletInfo(
           wallet_address=wallet_data["wallet_address"],
           wallet_id=wallet_data["wallet_id"],
           transaction_hash=domain_result.get("transaction_hash"),
           network="base-sepolia",
           status="active",
           balance="0"
       )
       
       # Prepare complete NPC data (without domain field)
       npc_data = {
           **config.dict(),
           "wallet": wallet_info.dict(),
           "avatar": f"https://api.cloudnouns.com/v1/pfp?text={wallet_info.wallet_address}",
           "created_at": datetime.utcnow().isoformat(),
           "updated_at": datetime.utcnow().isoformat(),
       }
       
       # Save to Supabase
       result = supabase.table('npcs').insert(npc_data).execute()
       
       if len(result.data) == 0:
           raise HTTPException(status_code=500, detail="Failed to save NPC to database")
           
       # Add domain to response but not to database
       response_data = {
           "status": "success",
           "message": "NPC created successfully",
           "npc": {**result.data[0], "domain": f"{domain_name}.npc.eth"},
           "wallet": wallet_info.dict(),
           "domain": f"{domain_name}.npc.eth"
       }
       
       # Save local config for agent
       if not save_npc_config(npc_data):
           print("Warning: Failed to save NPC configuration file")
       
       # Reinitialize agent
       global agent_executor
       agent_executor, agent_config = initialize_agent()
       
       return response_data
       
   except HTTPException as he:
       raise he
   except Exception as e:
       print(f"Error in save_config: {str(e)}")
       print(f"Traceback: {traceback.format_exc()}")
       raise HTTPException(
           status_code=500,
           detail=f"Failed to process NPC configuration: {str(e)}"
       )


agent_executor, config = initialize_agent()


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    print("WebSocket connected")
    
    while True:
        try:
            # Receive message
            data = await websocket.receive_json()
            message = data.get('message', '')
            
            if not message:
                continue
                
            if message == "ping":
                await websocket.send_json({"type": "pong", "content": "pong"})
                continue
            
            print(f"Received message: {message}")
            
            # Process message synchronously since agent_executor doesn't support async
            try:
                for chunk in agent_executor.stream(
                    {"messages": [HumanMessage(content=message)]},
                    config
                ):
                    if chunk is None:
                        continue
                        
                    if "agent" in chunk and chunk["agent"]["messages"]:
                        await websocket.send_json({
                            "type": "agent",
                            "content": chunk["agent"]["messages"][0].content
                        })
                        print(f"Sent agent response: {chunk['agent']['messages'][0].content}")
                    
                    elif "tools" in chunk and chunk["tools"]["messages"]:
                        await websocket.send_json({
                            "type": "tools",
                            "content": chunk["tools"]["messages"][0].content
                        })
                        print(f"Sent tools response: {chunk['tools']['messages'][0].content}")
                        
            except Exception as e:
                print(f"Error processing message: {str(e)}")
                await websocket.send_json({
                    "type": "agent",
                    "content": f"Error processing message: {str(e)}"
                })
                
        except WebSocketDisconnect:
            print("WebSocket disconnected")
            break
        except Exception as e:
            print(f"WebSocket error: {str(e)}")
            try:
                await websocket.send_json({
                    "type": "error",
                    "content": f"An error occurred: {str(e)}"
                })
            except:
                break


if __name__ == "__main__":
   import uvicorn
   uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
