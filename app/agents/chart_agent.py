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


def create_chart_agent():
    session_id = str(uuid.uuid4())[:8]
    chart_agent = AssistantAgent(
        name=f"ChartAgent_{session_id}",
        system_message=(
            "You are a chart agent expert. "
            "You should analyze provided metrics "
            "Given a list of metrics and a range parameter, for each metric, suggest the most suitable chart type for displaying it on the frontend. "
            "Return the result in the format: metric : chart_type. "
            "Only provide the mapping for each metric without any additional explanation."
        ),
        llm_config=LLM_CONFIG
    )
    return chart_agent
