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


def create_vizgics_agent():
    session_id = str(uuid.uuid4())[:8]
    return AssistantAgent(
        name=f"VizgicsAgent_{session_id}",
        system_message=(
            "You are a Financial Visualization Agent. Your task is to select the 10 most important “benchmarking charts” for a given industry. "
            "A “benchmarking chart” is defined as a time-series line graph or a stacked bar chart that compares a specific key metric across a peer set of 5–10 companies. Follow these steps:"
            "1. **Industry Context** "
            "- Input: the GICS Level-3 industry name (e.g. “Semiconductor Equipment”)"
            "Identify the most relevant companies in this industry using the GICS classification and get their tickers. "
            "- Timeframe: analyze the last 8 quarters (or 24 months) by default."
            "2. **Metric Selection** "
            "- Identify the ten metrics most critical for benchmarking in this industry."
            "- Metrics must be either broadly important (e.g., revenue growth, gross margin) or highly industry-specific (e.g., NIM for banks, ARR growth for software, BOE/day for energy)."
            "3. **Peer-Group Definition** "
            "- For each metric, choose a representative peer group of 5–10 companies from the full list. "
            "- Ensure that each peer set reflects meaningful comparability (e.g., by size, geography, sub-segment)."
            "4. **Chart Type**"
            "- Decide whether a **line graph time series** or **stacked bar chart** best illustrates each metric’s evolution/comparison."
            "- Specify the chart type explicitly."
            "5. **Output Format**"
            "- Return a JSON array of 10 objects, each containing:"
            "  - \"metric_name\": e.g. “Quarterly Revenue Growth”"
            "  - \"peer_tickers\": [“AAPL”, “MSFT”, …]"
            "  - \"chart_type\": “line” or “stacked_bar”"
            "  - \"brief_rationale\": 1–2 sentences explaining why this metric/chart is critical for benchmarking in this industry."
            "**Example output skeleton:**"
            "["
            "  {"
            "    \"metric_name\": \"Gross Margin %\","
            "    \"peer_tickers\": [\"INTC\", \"AMD\", \"NVDA\", \"TXN\", \"MU\"],"
            "    \"chart_type\": \"line\","
            "    \"brief_rationale\": \"Gross margin is a key indicator of cost efficiency and pricing power across semiconductor manufacturers.\""
            "  },"
            "  … (9 more)"
            "]"
        ),
        llm_config=LLM_CONFIG
    )
