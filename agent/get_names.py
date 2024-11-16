
from web3 import Web3
from web3.exceptions import ContractLogicError

RPC_URL = "https://base-sepolia.blockpi.network/v1/rpc/public"  # e.g., "https://mainnet.infura.io/v3/YOUR-PROJECT-ID"
CONTRACT_ADDRESS = "0xab8CF91658009e0Eb123c60bCe2120A7E13C9ff2"
LABEL = "test"  # or "boomboom"

def get_address_for_label(label):
    w3 = Web3(Web3.HTTPProvider(RPC_URL))
    
    # Calculate labelhash as done in the contract
    labelhash = w3.keccak(text=label)
    
    # Minimal ABI for addr function
    abi = [
        {
            "inputs": [{"name": "labelhash", "type": "bytes32"}],
            "name": "addr",
            "outputs": [{"name": "", "type": "address"}],
            "type": "function"
        }
    ]
    
    contract = w3.eth.contract(address=w3.to_checksum_address(CONTRACT_ADDRESS), abi=abi)
    
    try:
        address = contract.functions.addr(labelhash).call()
        print(f"\nLabel: {label}")
        print(f"Address: {address}")
    except Exception as e:
        print(f"Error looking up address: {str(e)}")

if __name__ == "__main__":
    get_address_for_label(LABEL)