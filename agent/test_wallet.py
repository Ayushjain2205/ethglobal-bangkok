from fastapi import FastAPI, WebSocket, HTTPException
from pydantic import BaseModel
import os
from dotenv import load_dotenv
import json
from cdp import Cdp
from cdp import *


# Load environment variables
load_dotenv()

def test_create_wallet():
    try:
        print("Initializing CDP SDK...")
        
        # Use the same initialization as chatbot.py
        api_key = os.getenv('CDP_API_KEY')
        api_secret = os.getenv('CDP_API_SECRET')
        network_id = os.getenv('CDP_NETWORK_ID', 'base-sepolia')
        
        print(api_key)
        print(api_secret)
        print(network_id)

        if not api_key or not api_secret:
            raise ValueError("CDP API credentials not found in environment variables")
            
        print(f"API Key: {api_key[:10]}...")
        print(f"Network ID: {network_id}")
        
        # Configure the SDK exactly as in chatbot.py
      
        Cdp.configure(api_key, api_secret)
        print("CDP SDK configured successfully")
        
        # Create a wallet using the same method as chatbot.py
        print("Creating new wallet...")
        wallet = Wallet.create(network_id)
        
        print("\nWallet Details:")
        print(f"Address: {wallet.address}")
        
        return {
            "status": "success",
            "wallet_address": wallet.address,
            "wallet_id": wallet.id if hasattr(wallet, 'id') else None
        }
    except Exception as e:
        print(f"\nError creating wallet: {str(e)}")
        print(f"Error type: {type(e)}")
        return {
            "status": "error",
            "message": str(e)
        }

if __name__ == "__main__":
    print("Starting wallet creation test...")
    result = test_create_wallet()
    print(f"\nTest Result: {result['status']}") 