import json
import re
from app.agents.ticker_agent import create_ticker_agent, LLM_CONFIG
from app.agents.competitor_agent import create_competitor_agents
from app.agents.metric_agent import create_metric_agent
from app.agents.chart_agent import create_chart_agent
from app.agents.vizgics_agent import create_vizgics_agent


def try_generate_reply(agent, messages, llm_config):
    for config in llm_config["config_list"]:
        try:
            print(f"Trying model: {config['model']}")
            response = agent.generate_reply(
                messages,
                llm_config={**llm_config, "config_list": [config]}
            )
            return response
        except Exception as e:
            print(f"Model {config['model']} failed: {e}")
    return None


def fetch_tickers_by_industry(industry_name: str):
    agent = create_ticker_agent()
    user_prompt = f"List the top company tickers in the industry: '{industry_name}'. Only return a JSON array of tickers, no explanations or extra text.'"

    response = try_generate_reply(
        agent, [{"role": "user", "content": user_prompt}], llm_config=LLM_CONFIG)

    if not response:
        print("All models failed to generate a reply.")
        return []

    content = response["content"].strip()
    content = re.sub(r"^```(?:json)?\n|```$", "", content).strip()
    print("Agent response content:", content)

    try:
        tickers = json.loads(content)
        if isinstance(tickers, list):
            return tickers
    except json.JSONDecodeError:
        print("Failed to parse JSON from agent response:", content)

    return []


def fetch_metrics_by_industry(industry_name: str):
    agent = create_metric_agent()
    user_prompt = (
        f"List the most important and relevant metrics for the industry: '{industry_name}'. "
        "Only return a JSON array of metrics in camelCase notation as found on Financial Modeling Prep (FMP), "
        "with no explanations or extra text."
    )

    response = try_generate_reply(
        agent, [{"role": "user", "content": user_prompt}], llm_config=LLM_CONFIG
    )

    if not response:
        print("All models failed to generate a reply.")
        return []

    content = response["content"].strip()
    content = re.sub(r"^```(?:json)?\n|```$", "", content).strip()
    print("Agent response content:", content)

    try:
        metrics = json.loads(content)
        if isinstance(metrics, list):
            return metrics
    except json.JSONDecodeError:
        print("Failed to parse JSON from agent response:", content)
        return []


def fetch_competitors_by_ticker(ticker: str):
    industries_agent, competitors_agent = create_competitor_agents()

    # Fetch industries for the ticker
    industries_prompt = f"List the industries for the company with ticker: '{ticker}'. Only return a JSON array of industries, no explanations or extra text."
    industries_response = industries_agent.generate_reply(
        [{"role": "user", "content": industries_prompt}], llm_config=LLM_CONFIG)
    industries_content = industries_response["content"].strip()
    industries_content = re.sub(
        r"^```(?:json)?\n|```$", "", industries_content).strip()

    print("Industries response content:", industries_content)
    try:
        industries = json.loads(industries_content)
        if not isinstance(industries, list) or not industries:
            raise ValueError("Industries response is not a valid list")
    except (json.JSONDecodeError, ValueError) as e:
        print("Failed to parse industries:", e)
        return []

    # Use the first industry found
    selected_industry = industries[0]

    # Fetch competitors based on the industry
    competitors_prompt = (
        f"List the top competitors for the company with ticker: '{ticker}' in the industry: '{selected_industry}'. "
        "Only return a JSON array of tickers, no explanations or extra text."
    )
    competitors_response = competitors_agent.generate_reply(
        [{"role": "user", "content": competitors_prompt}], llm_config=LLM_CONFIG)
    competitors_content = competitors_response["content"].strip()
    competitors_content = re.sub(
        r"^```(?:json)?\n|```$", "", competitors_content).strip()
    try:
        competitors = json.loads(competitors_content)
        if isinstance(competitors, list):
            print("Competitors response content:", competitors_content)
            return selected_industry, competitors
    except json.JSONDecodeError:
        print("Failed to parse competitors response:", competitors_content)

    return []


def analyze_chart_type(metrics: list, range: str):
    chart_agent = create_chart_agent()
    user_prompt = (
        f"Given the following metrics: {', '.join(metrics)}, and the range: '{range}', "
        "suggest the most suitable chart type for each metric. "
        "Return the result in the format: metric : chart_type, without any additional explanation."
    )

    response = try_generate_reply(
        chart_agent, [{"role": "user", "content": user_prompt}], llm_config=LLM_CONFIG)

    if not response:
        print("All models failed to generate a reply.")
        return {}

    content = response["content"].strip()
    content = re.sub(r"^```(?:json)?\n|```$", "", content).strip()
    print("Chart agent response content:", content)

    chart_types = {}
    for line in content.splitlines():
        if ':' in line:
            metric, chart_type = line.split(':')
            chart_types[metric.strip()] = chart_type.strip()
    return chart_types


def generate_vizgics_report(industry_name: str):
    vizgics_agent = create_vizgics_agent()
    user_prompt = (
        f"Generate a report for the industry: '{industry_name} "
        "For each metric, provide the chart type and a brief rationale for its importance. "
        "Return the result in JSON format with fields: metric_name, peer_tickers, chart_type, timeframe, brief_rationale."
    )
    response = try_generate_reply(
        vizgics_agent, [{"role": "user", "content": user_prompt}], llm_config=LLM_CONFIG)

    if not response:
        print("All models failed to generate a reply.")
        return {}

    content = response["content"].strip()
    content = re.sub(r"^```(?:json)?\n|```$", "", content).strip()
    # print("Chart agent response content:", content)

    # chart_types = {}
    # for line in content.splitlines():
    #     if ':' in line:
    #         metric, chart_type = line.split(':')
    #         chart_types[metric.strip()] = chart_type.strip()
    return content
