import requests
from typing import Dict, Any, List
import yfinance as yf
import math
from joblib import Parallel, delayed
from datetime import datetime


FINNHUB_API_KEY = 'd0qpm39r01qg1llb6be0d0qpm39r01qg1llb6beg'

FINNHUB_KEYS = {
    "bs": [
        "Cash and cash equivalents",
        "Investments",
        "Total assets",
        "Accounts payable",
        "Total current liabilities",
        "Borrowings",
        "Total equity",
        "Total liabilities and equity"
    ],
    "cf": [
        "Net income",
    ],
    "ic": [
        "Revenues",
        "Total Revenues",
        "Operating expenses",
        "Interest income (expense), net",
        "Net income",
        "Basic (in dollars per share)",  # earning per share basic
        "Diluted (in dollars per share)"
    ]
}

YFINANCE_KEYS = {
    "financials": {
        "Basic Average Shares",
        "Basic EPS",
        "Diluted EPS",
        "EBIT",
        "EBITDA",
        "Normalized EBITDA",
        "Earnings From Equity Interest",
        "Selling General And Administration",
        "Operating Income",
        "Total Revenue",
        "Interest Expense"
    },
    "balance_sheet": {
        "Inventory",
        "Net Debt",
        "Receivables",
        "Stockholders Equity",
        "Total Liabilities Net Minority Interest",
        "Current Assets",
        "Payables",
        "Current Liabilities"
    },
    "cashflow": {
        "Capital Expenditure",
        "Cash Flow From Continuing Financing Activities",
        "Cash Flow From Continuing Investing Activities",
        "Cash Flow From Continuing Operating Activities"
    }
}


def convert_keys_to_str(d):
    if isinstance(d, dict):
        return {str(k): convert_keys_to_str(v) for k, v in d.items()}
    elif isinstance(d, list):
        return [convert_keys_to_str(i) for i in d]
    else:
        return d


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


def get_yfinance_data(ticker: str) -> Dict:
    try:
        stock = yf.Ticker(ticker)
        annual = {}
        quarterly = {}

        # Annual Data
        if stock.financials is not None:
            filtered_df = stock.financials.loc[
                stock.financials.index.intersection(
                    YFINANCE_KEYS["financials"])
            ]
            annual["financials"] = convert_keys_to_str(filtered_df.to_dict())
        else:
            annual["financials"] = {}

        if stock.cashflow is not None:
            filtered_df = stock.cashflow.loc[
                stock.cashflow.index.intersection(YFINANCE_KEYS["cashflow"])
            ]
            annual["cashflow"] = convert_keys_to_str(filtered_df.to_dict())
        else:
            annual["cashflow"] = {}

        if stock.balance_sheet is not None:
            filtered_df = stock.balance_sheet.loc[
                stock.balance_sheet.index.intersection(
                    YFINANCE_KEYS["balance_sheet"])
            ]
            annual["balance_sheet"] = convert_keys_to_str(
                filtered_df.to_dict())
        else:
            annual["balance_sheet"] = {}

        # Quarterly Data
        if stock.quarterly_financials is not None:
            filtered_df = stock.quarterly_financials.loc[
                stock.quarterly_financials.index.intersection(
                    YFINANCE_KEYS["financials"])
            ]
            quarterly["financials"] = convert_keys_to_str(
                filtered_df.to_dict())
        else:
            quarterly["financials"] = {}

        if stock.quarterly_cashflow is not None:
            filtered_df = stock.quarterly_cashflow.loc[
                stock.quarterly_cashflow.index.intersection(
                    YFINANCE_KEYS["cashflow"])
            ]
            quarterly["cashflows"] = convert_keys_to_str(filtered_df.to_dict())
        else:
            quarterly["cashflows"] = {}

        if stock.quarterly_balance_sheet is not None:
            filtered_df = stock.quarterly_balance_sheet.loc[
                stock.quarterly_balance_sheet.index.intersection(
                    YFINANCE_KEYS["balance_sheet"])
            ]
            quarterly["balance_sheets"] = convert_keys_to_str(
                filtered_df.to_dict())
        else:
            quarterly["balance_sheets"] = {}

        return sanitize_json({
            "annual": annual,
            "quarterly": quarterly
        })

    except Exception as e:
        return {"error": str(e)}


def filter_dict(d: Dict, allowed_keys: List[str]) -> Dict:
    return {k: v for k, v in d.items() if k in allowed_keys}


def filter_finnhub_report(report: Dict[str, List[Dict[str, Any]]]) -> Dict[str, List[Dict[str, Any]]]:
    filtered_report = {}
    for section in ["bs", "cf", "ic"]:
        items = report.get(section, [])
        keys = FINNHUB_KEYS.get(section, [])
        filtered_items = [item for item in items if item.get("label") in keys]
        filtered_report[section] = filtered_items
    return filtered_report


def get_finnhub_data(ticker: str) -> Dict:
    try:
        results = {}
        for freq in ["quarterly", "annual"]:
            url = f"https://finnhub.io/api/v1/stock/financials-reported?symbol={ticker}&freq={freq}&token={FINNHUB_API_KEY}"
            response = requests.get(url)
            if not response.ok:
                results[freq] = {"error": response.text}
                continue
            data = response.json()

            if "data" in data:
                for period in data["data"]:
                    if "report" in period:
                        period["report"] = filter_finnhub_report(
                            period["report"])

            results[freq] = sanitize_json(data)
        return results

    except Exception as e:
        return {"error": str(e)}


def get_financial_data(tickers: List[str], range) -> List[dict]:

    yfinance_results = Parallel(n_jobs=5)(
        delayed(get_yfinance_data)(ticker) for ticker in tickers
    )
    yfinance_data = {ticker: {"yfinance": data}
                     for ticker, data in zip(tickers, yfinance_results)}

    finnhub_results = Parallel(n_jobs=5)(
        delayed(get_finnhub_data)(ticker) for ticker in tickers
    )
    finnhub_data = {ticker: {"finnhub": data}
                    for ticker, data in zip(tickers, finnhub_results)}

    yfinance_transformed = transform_yfinance_data(yfinance_data)
    finnhub_transformed = transform_finnhub_data(finnhub_data)
    combined = {}

    # Add yfinance data
    for item in yfinance_transformed:
        ticker = item["ticker"]
        combined.setdefault(ticker, {})
        for key, values in item["financials"].items():
            combined[ticker].setdefault(key, []).extend(values)

    # Add finnhub data
    for item in finnhub_transformed:
        ticker = item["ticker"]
        combined.setdefault(ticker, {})
        for key, values in item["financials"].items():
            combined[ticker].setdefault(key, []).extend(values)

    min_period = get_min_period(range)

    # Sort periods for each financial key
    result = []
    for ticker, financials in combined.items():
        for key in financials:
            financials[key] = [entry for entry in financials[key]
                               if entry["period"] >= min_period]
            financials[key].sort(key=lambda x: x["period"])
        result.append({
            "ticker": ticker,
            "financials": financials
        })

    return result


def transform_finnhub_data(raw_data: dict) -> list[dict]:
    peer_data_list = []
    frequency = ["quarterly", "annual"]

    for ticker, obj in raw_data.items():
        financials = {}
        for freq in frequency:

            reports = obj.get("finnhub", {}).get(freq, {}).get("data", [])
            for entry in reports:
                year = entry.get("year")
                if freq == "annual":
                    quarter = 4
                else:
                    quarter = entry.get("quarter")
                if not year or not quarter:
                    continue
                period = f"{year}-Q{quarter}"

                for section in ["ic", "bs", "cf"]:
                    items = entry.get("report", {}).get(section, [])
                    for item in items:
                        label = item.get("label")
                        value = item.get("value")
                        if label is None or value is None:
                            continue
                        financials.setdefault(label, []).append({
                            "period": period,
                            "value": value
                        })

        for key in financials:
            financials[key].sort(key=lambda x: x["period"])

        peer_data_list.append({
            "ticker": ticker,
            "financials": financials
        })

    return peer_data_list


def transform_yfinance_data(raw_data: dict) -> list[dict]:
    peer_data_list = []
    frequency = ["annual", "quarterly"]

    for ticker, obj in raw_data.items():
        financials = {}
        for freq in frequency:
            freq_data = obj.get("yfinance", {}).get(freq, {})
            for section in ["financials", "cashflow", "balance_sheet"]:
                section_data = freq_data.get(section, {})
                for period, label_dict in section_data.items():
                    for label, value in label_dict.items():
                        if value is None:
                            continue
                        if freq == "quarterly":
                            try:
                                year, month, _ = period.split("-")
                                q = (int(month) - 1) // 3 + 1
                                period_formatted = f"{year}-Q{q}"
                            except Exception:
                                period_formatted = str(period)
                        else:
                            period_formatted = str(period)[:4]
                        financials.setdefault(label, []).append({
                            "period": period_formatted,
                            "value": float(value) if value is not None else None
                        })
        for key in financials:
            financials[key].sort(key=lambda x: x["period"])
        peer_data_list.append({
            "ticker": ticker,
            "financials": financials
        })
    return peer_data_list


def get_financials_for_tickers(tickers: List[str], range):
    return get_financial_data(tickers, range)
