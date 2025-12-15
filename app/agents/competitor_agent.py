from autogen import AssistantAgent
import uuid
import os

LLM_CONFIG = {
    "temperature": 0.4,
    "config_list": [
        {
            "model": "deepseek-chat",
            "api_key": os.getenv("DEEPSEEK_API_KEY"),
            "api_type": "deepseek",
            "base_url": "https://api.deepseek.com"
        },
        {
            "model": "gemini-2.0-flash",
            "api_key": os.getenv("GOOGLE_API_KEY"),
            "api_type": "google"
        },
        {
            "model": "claude-3-5-sonnet-20241022",
            "api_key": os.getenv("ANTHROPIC_API_KEY"),
            "api_type": "anthropic",
            "base_url": "https://api.anthropic.com/v1"
        }
    ]
}


def create_competitor_agents():
    session_id = str(uuid.uuid4())[:8]
    industries_agent = AssistantAgent(
        name=f"IndustriesAgent_{session_id}",
        system_message=(
            "You are an industries agent. "
            "Given a company ticker, return a JSON array of industries that the company belongs to. "
            "The entries of this list should only have industry names and no extra text or symbols. "
            "Return ONLY a JSON list of industries, no explanations or extra text."
        ),
        llm_config=LLM_CONFIG
    )

    competitors_agent = AssistantAgent(
        name=f"CompetitorsAgent_{session_id}",
        system_message=(
            "You are a competitors agent. "
            "Given a company ticker and a list of industries, return a JSON array of tickers for competitor companies. "
            "For each industry, you should research and find the top competitors in that industry. "
            "The entries of this list should only have tickers and no extra text or symbols. "
            "Return ONLY a JSON list of tickers, no names or explanations or extra text."
        ),
        llm_config=LLM_CONFIG
    )
    return industries_agent, competitors_agent
