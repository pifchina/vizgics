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


def create_metric_agent():
    session_id = str(uuid.uuid4())[:8]
    flat_metrics_agent = AssistantAgent(
        name=f"FlatMetricAgent_{session_id}",
        system_message=(
            "You are a metric agent. "
            "Given the name of an industry, identify and return the most important and relevant metrics for that industry. "
            "Focus on metrics that are widely used to evaluate performance, growth, or success within the specified industry. "
            "IMPORTANT: The metrics you provide should match the naming and format as found on Financial Modeling Prep (FMP), "
            "since they will be fetched from FMP. "
            "Return ONLY a JSON list containing all relevant metrics from both the income statement endpoint "
            "(https://financialmodelingprep.com/stable/income-statement) and the balance sheet statement endpoint "
            "(https://financialmodelingprep.com/stable/balance-sheet-statement). "
            "Do not include explanations or extra text. "
            "The metrics you return must be in camelCase notation, as they appear on FMP (e.g., grossProfit). "
            "Abbreviations should be in all lowercase (e.g., ebitda). "
            "Return only metrics which FMP has data for. "
            "You MUST check that all metrics you provide are available on either the income-statement or balance-sheet-statement endpoint. "
            "Return the metrics in the following JSON format: "
            "[...] "
            "You must always return EXACTLY 12 metrics. "
            "Always include the following 6 metrics: revenue, grossProfit, eps, ebitda, netIncome, and totalAssets. "
            "In addition to these, return 6 more metrics that are the most important for the given industry."
        ),
        llm_config=LLM_CONFIG
    )
    return flat_metrics_agent
