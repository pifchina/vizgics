from flask import Blueprint, request, jsonify
from app.services.agent_service import fetch_tickers_by_industry
from app.services.yfinance_service import get_financials_for_tickers
from app.services.agent_service import fetch_competitors_by_ticker
from app.services.agent_service import fetch_metrics_by_industry
from app.services.fmp_service import get_fmp_data

main = Blueprint('main', __name__)


@main.route('/api/industry-leaders')
def get_peers():
    industry = request.args.get('industry')
    range = request.args.get('range', '1Y')
    if not industry:
        return jsonify({'error': 'industry query parameter required'}), 400

    tickers = fetch_tickers_by_industry(industry)
    print(f"Found tickers for industry MAIN '{industry}': {tickers}")
    if not tickers:
        return jsonify({'error': 'No tickers found for industry'}), 404

    return jsonify(get_financials_for_tickers(tickers, range))


@main.route('/api/competitors')
def get_peers_by_ticker():
    ticker = request.args.get('ticker')
    range = request.args.get('range', '1Y')
    limit = int(request.args.get('limit', 6))
    offset = int(request.args.get('offset', 0))
    if not ticker:
        return jsonify({'error': 'ticker query parameter required'}), 400

    industry, competitors = fetch_competitors_by_ticker(ticker)
    if not competitors:
        return jsonify({'error': 'No competitors found for ticker'}), 404

    tickers = [ticker] + competitors
    all_metrics = fetch_metrics_by_industry(industry)
    selected_metrics = all_metrics[offset * limit: (offset + 1) * limit]
    results = get_fmp_data(tickers, range, selected_metrics)
    return jsonify(results)


@main.route('/api/fmp-data')
def get_fmp_data_route():
    industry = request.args.get('industry')
    range = request.args.get('range', '1Y')
    limit = int(request.args.get('limit', 6))
    offset = int(request.args.get('offset', 0))

    if not industry:
        return jsonify({'error': 'industry query parameter required'}), 400

    tickers = fetch_tickers_by_industry(industry)
    all_metrics = fetch_metrics_by_industry(industry)
    selected_metrics = all_metrics[offset * limit: (offset + 1) * limit]

    return jsonify(get_fmp_data(tickers, range, selected_metrics))
