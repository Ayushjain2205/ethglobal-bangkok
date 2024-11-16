from web3 import Web3
from eth_account import Account
import os

def register_domain(domain_name: str, owner_address: str, private_key: str, rpc_url: str, contract_address: str):
    """
    Register a domain name on the L2Registry contract
    
    Args:
        domain_name: The name to register
        owner_address: The address that will own the name
        private_key: Private key of the registrar account
        rpc_url: URL of the RPC endpoint
        contract_address: Address of the L2Registry contract
    """
    # Connect to network
    w3 = Web3(Web3.HTTPProvider(rpc_url))
    
    # Create account object from private key
    account = Account.from_key(private_key)
    
    # Contract ABI - only including the functions we need
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
    contract = w3.eth.contract(address=contract_address, abi=abi)
    
    # Build transaction
    nonce = w3.eth.get_transaction_count(account.address)
    
    transaction = contract.functions.register(
        domain_name,
        owner_address
    ).build_transaction({
        'from': account.address,
        'nonce': nonce,
        'gas': 300000,  # Adjust gas limit as needed
        'gasPrice': w3.eth.gas_price
    })
    
    # Sign transaction
    signed_txn = w3.eth.account.sign_transaction(transaction, private_key)
    
    # Send transaction
    tx_hash = w3.eth.send_raw_transaction(signed_txn.raw_transaction)  # Changed from rawTransaction to raw_transaction
    
    # Wait for transaction receipt
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    
    return receipt

if __name__ == "__main__":
    # Configuration
    DOMAIN_NAME = "example1"  # Domain name to register
    OWNER_ADDRESS = "0xCafa93E9985793E2475bD58B9215c21Dbd421fD0"
    RPC_URL = "https://base-sepolia.blockpi.network/v1/rpc/public"  # e.g., "https://mainnet.infura.io/v3/YOUR-PROJECT-ID"
    CONTRACT_ADDRESS = "0xab8CF91658009e0Eb123c60bCe2120A7E13C9ff2"
    ETH_PRIVATE_KEY =  os.getenv("ETH_PRIVATE_KEY")  # Private key of the registrar account
    print(ETH_PRIVATE_KEY)
    
    try:
        # Check if Web3 is connected
        w3 = Web3(Web3.HTTPProvider(RPC_URL))
        if not w3.is_connected():
            raise Exception("Failed to connect to the network")
            
        receipt = register_domain(
            DOMAIN_NAME,
            OWNER_ADDRESS,
            ETH_PRIVATE_KEY,
            RPC_URL,
            CONTRACT_ADDRESS
        )
        print(f"Domain registration successful!")
        print(f"Transaction hash: {receipt['transactionHash'].hex()}")
    except Exception as e:
        print(f"Error registering domain: {str(e)}")
