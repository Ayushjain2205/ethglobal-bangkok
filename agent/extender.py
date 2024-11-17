from cdp import Wallet, hash_message
from cdp_langchain.tools import CdpTool
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

# Custom action schemas
class PredictionMarketBet(BaseModel):
    """Input schema for prediction market betting."""
    market_id: str = Field(..., description="The ID of the prediction market")
    position: str = Field(..., description="'long' or 'short' position")
    amount: float = Field(..., description="Amount to bet in ETH")
    confidence: int = Field(..., description="Confidence level (0-100)")

class TokenAnalysis(BaseModel):
    """Input schema for token analysis."""
    token_address: str = Field(..., description="The token contract address to analyze")
    metrics: List[str] = Field(
        default=["liquidity", "volume", "holders", "price_history"],
        description="Metrics to analyze"
    )

class TokenDiscovery(BaseModel):
    """Input schema for token discovery."""
    min_liquidity: Optional[float] = Field(
        default=1000,
        description="Minimum liquidity in ETH"
    )
    max_age: Optional[int] = Field(
        default=7,
        description="Maximum age in days"
    )
    min_holders: Optional[int] = Field(
        default=100,
        description="Minimum number of holders"
    )

# Custom action implementations
def place_prediction_bet(wallet: Wallet, bet: PredictionMarketBet) -> str:
    """Place a bet on a prediction market."""
    try:
        # Implementation would interact with prediction market contracts
        return f"""
        Bet placed successfully:
        Market: {bet.market_id}
        Position: {bet.position}
        Amount: {bet.amount} ETH
        Confidence: {bet.confidence}%
        """
    except Exception as e:
        return f"Error placing bet: {str(e)}"

def analyze_token(wallet: Wallet, analysis: TokenAnalysis) -> str:
    """Analyze a token's metrics and provide insights."""
    try:
        # Implementation would fetch on-chain data and analyze metrics
        return f"""
        Token Analysis for {analysis.token_address}:
        - Liquidity: Analyzing pool depth and stability
        - Volume: Checking 24h trading volume
        - Holders: Analyzing holder distribution
        - Price History: Examining price movements
        
        Analysis complete. Token appears to be {get_risk_assessment(analysis.token_address)}.
        """
    except Exception as e:
        return f"Error analyzing token: {str(e)}"

def discover_tokens(wallet: Wallet, params: TokenDiscovery) -> str:
    """Find new tokens matching specified criteria."""
    try:
        # Implementation would scan DEXs and token listings
        return f"""
        Discovered tokens matching criteria:
        1. Token A (0x123...): New DeFi protocol, 2000 ETH liquidity
        2. Token B (0x456...): GameFi project, 1500 ETH liquidity
        3. Token C (0x789...): DAO governance token, 3000 ETH liquidity
        
        Detailed analysis available using analyze_token tool.
        """
    except Exception as e:
        return f"Error discovering tokens: {str(e)}"

def get_risk_assessment(token_address: str) -> str:
    """Helper function to assess token risk."""
    # Implementation would analyze various risk factors
    return "MEDIUM RISK - Moderate liquidity, growing holder base"

def initialize_agent():
    """Initialize the agent with CDP Agentkit and custom tools."""
    agentkit = CdpAgentkitWrapper(**values)
    cdp_toolkit = CdpToolkit.from_cdp_agentkit_wrapper(agentkit)
    base_tools = cdp_toolkit.get_tools()

    # Create custom tools
    prediction_tool = CdpTool(
        name="place_prediction_bet",
        description="Place a bet on a prediction market with specified position and amount",
        cdp_agentkit_wrapper=agentkit,
        args_schema=PredictionMarketBet,
        func=place_prediction_bet,
    )

    analysis_tool = CdpTool(
        name="analyze_token",
        description="Analyze a token's metrics and provide detailed insights",
        cdp_agentkit_wrapper=agentkit,
        args_schema=TokenAnalysis,
        func=analyze_token,
    )

    discovery_tool = CdpTool(
        name="discover_tokens",
        description="Find new tokens matching specified criteria",
        cdp_agentkit_wrapper=agentkit,
        args_schema=TokenDiscovery,
        func=discover_tokens,
    )

    # Combine all tools
    all_tools = base_tools + [prediction_tool, analysis_tool, discovery_tool]

    # Store buffered conversation history in memory
    memory = MemorySaver()
    config = {"configurable": {"thread_id": "Enhanced CDP Agentkit Agent"}}

    # Create ReAct Agent with enhanced capabilities
    state_modifier = """You are an advanced AI agent specialized in DeFi operations and market analysis.
    You can:
    1. Place bets on prediction markets with careful risk assessment
    2. Analyze tokens using multiple metrics (liquidity, volume, holders, price)
    3. Discover new tokens matching specific criteria
    
    Always explain your reasoning and provide risk warnings when appropriate.
    Consider the NPC's personality traits when making decisions:
    - Risk Tolerance affects bet sizes and token recommendations
    - Rationality influences analysis depth and decision-making
    - Autonomy determines how much confirmation you seek before actions
    
    Remember to:
    - Start with analysis before making recommendations
    - Provide clear risk warnings
    - Explain your reasoning
    - Consider the user's goals and risk tolerance
    """

    return create_react_agent(
        llm,
        tools=all_tools,
        checkpointer=memory,
        state_modifier=state_modifier,
    ), config