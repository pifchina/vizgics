from datetime import datetime
import math
import requests
import os
from typing import Dict, List
from joblib import Parallel, delayed

FMP_API_KEY = os.getenv("FMP_API_KEY")


def sanitize_json(data):
    if isinstance(data, dict):
        return {k: sanitize_json(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [sanitize_json(item) for item in data]
    elif isinstance(data, float):
        if math.isnan(data) or math.isinf(data):
            return None
        return data
    return data


def get_min_period(range: str) -> str:
    years = {"1Y": 1, "3Y": 3, "5Y": 5}.get(range.upper(), 1)
    today = datetime.today()
    cutoff_year = today.year - years
    quarter = (today.month - 1) // 3 + 1
    return f"{cutoff_year}-Q{quarter}"


def get_max_period() -> str:
    today = datetime.today()
    return f"{today.year}-Q{(today.month - 1) // 3 + 1}"


def parse_period(period_str: str) -> tuple[int, int]:
    year, quarter = period_str.split("-Q")
    return int(year), int(quarter)


def transform_fmp_data(ticker: str, raw_data: dict, range: str, agent_response: List[str]) -> dict:
    financials = {}
    min_period_tuple = parse_period(get_min_period(range))
    max_period_tuple = parse_period(get_max_period())

    for entry in raw_data.get("data", []):
        year = entry.get("fiscalYear")
        period = entry.get("period")
        if not year or not period:
            continue

        period_label = f"{year}-{period}"
        period_tuple = (int(year), int(period[1]))

        if period_tuple < min_period_tuple or period_tuple > max_period_tuple:
            continue

        for key in agent_response:
            if key in entry and entry[key] is not None:
                financials.setdefault(key, []).append({
                    "period": period_label,
                    "value": entry[key]
                })

    for key in financials:
        financials[key].sort(key=lambda x: x["period"])

    return {
        "ticker": ticker,
        "financials": financials
    }


def fetch_ticker_data(ticker: str, range: str, agent_response: List[str]) -> dict:
    all_data = []
    periods = ["Q1", "Q2", "Q3", "Q4"]

    for period in periods:
        for section in ["income-statement", "balance-sheet-statement"]:
            try:
                url = f"https://financialmodelingprep.com/stable/{section}?symbol={ticker}&period={period}&apikey={FMP_API_KEY}"
                response = requests.get(url)
                data = response.json()

                if isinstance(data, list):
                    all_data.extend(data)
                else:
                    all_data.append(data)
            except Exception as e:
                all_data.append({"error": str(e), "source": section})

    all_data = sanitize_json(all_data)
    return transform_fmp_data(ticker, {"data": all_data}, range, agent_response)


def get_fmp_data(tickers: List[str], range: str, agent_response: List[str]) -> List[Dict]:
    return Parallel(n_jobs=-1)(
        delayed(fetch_ticker_data)(ticker, range, agent_response)
        for ticker in tickers
    )
