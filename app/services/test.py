from app.services.agent_service import generate_vizgics_report


def test_analyze_chart_type():
    industry_name = input(
        "Enter the industry name (e.g., 'Semiconductor Equipment'): ")

    result = generate_vizgics_report(industry_name=industry_name)

    print("Analyzed chart types:", result)


test_analyze_chart_type()
