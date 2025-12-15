from autogen import AssistantAgent
import uuid
import os

LLM_CONFIG = {
    "temperature": 0.4,
    "config_list": [
        {
            "model": "gemini-2.0-flash",
            "api_key": os.getenv("GOOGLE_API_KEY"),
            "api_type": "google"
        },
        {
            "model": "deepseek-chat",
            "api_key": os.getenv("DEEPSEEK_API_KEY"),
            "api_type": "deepseek",
            "base_url": "https://api.deepseek.com"
        },
        {
            "model": "claude-3-5-sonnet-20241022",
            "api_key": os.getenv("ANTHROPIC_API_KEY"),
            "api_type": "anthropic",
            "base_url": "https://api.anthropic.com/v1"
        }
    ]
}


def create_ticker_agent():
    session_id = str(uuid.uuid4())[:8]
    return AssistantAgent(
        name=f"TickerAgent_{session_id}",
        system_message=(
            "You are a financial data assistant. "
            "Given an industry or market segment name, "
            "return a JSON array of relevant company stock tickers in that industry. The entries of this list should only have tickers and no extra text or symbols"
            "Return ONLY a JSON list of tickers, no explanations or extra text."
            "IMPORTANT! Do not return any company names, only the tickers. If a company doesnt have a publicly traded ticker, do not include it in the list."
        ),
        llm_config=LLM_CONFIG
    )
