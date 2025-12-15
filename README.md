# Vizgics - Dynamic Peer Analytics Platform

A comprehensive full-stack application for comparing companies and industries using **AI-powered agent orchestration** and **real-time financial data visualization**.

## 📋 Table of Contents

- [Overview](#-overview)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Features](#-features)
- [Getting Started](#-getting-started)
- [API Endpoints](#-api-endpoints)
- [Architecture](#-architecture)
- [Configuration](#-configuration)

## 🎯 Overview

Vizgics enables users to:

- **Compare companies** within an industry and analyze key financial metrics
- **Explore competitor landscapes** for individual companies
- **Visualize financial trends** across peer groups using interactive charts
- **Dynamically filter metrics** and apply statistical outlier removal
- **Switch between** line and bar chart visualizations

The platform leverages **LLM agents** (DeepSeek, Gemini, Claude) to intelligently identify industry peers and relevant metrics, then fetches real financial data from **Financial Modeling Prep** and **yfinance**.

## 🛠 Tech Stack

### Backend

- **Framework:** Flask 3.1.1
- **Database:** SQLite with SQLAlchemy ORM
- **AI/LLM:** AutoGen with DeepSeek, Google Gemini, and Claude
- **Financial Data:**
  - yfinance 0.2.61 (stock data)
  - Financial Modeling Prep API (detailed financials)
- **CORS:** flask-cors 6.0.0
- **Parallelization:** joblib

### Frontend

- **Framework:** React 19.1.0 with TypeScript
- **Build Tool:** Vite 6.3.5
- **UI Library:** Material UI (MUI) 7.1.1
- **Charts:** ECharts 5.6.0
- **Data Fetching:** TanStack React Query 5.80.7 + Axios
- **Routing:** React Router DOM 7.6.2

## 📁 Project Structure

```
vizgics/
├── app/                          # Backend Flask application
│   ├── __init__.py               # Flask app factory
│   ├── agents/                   # LLM agent definitions
│   │   ├── ticker_agent.py       # Identifies companies by industry
│   │   ├── competitor_agent.py   # Finds competitors for a ticker
│   │   ├── metric_agent.py       # Selects relevant metrics
│   │   ├── chart_agent.py        # Recommends chart types
│   │   └── vizgics_agent.py      # Generates comprehensive reports
│   ├── services/                 # Business logic layer
│   │   ├── agent_service.py      # Orchestrates LLM agents
│   │   ├── fmp_service.py        # Financial Modeling Prep API integration
│   │   ├── yfinance_service.py   # yfinance data fetching & transformation
│   │   └── test.py               # Testing utilities
│   └── routes/
│       └── main.py               # API endpoints
├── frontend/                     # React + TypeScript application
│   ├── src/
│   │   ├── pages/                # Page components
│   │   │   ├── PeerExplorer.tsx  # Main navigation container
│   │   │   ├── IndustryView.tsx  # Industry comparison view
│   │   │   └── CompanyView.tsx   # Company competitor view
│   │   ├── components/           # Reusable UI components
│   │   │   ├── Controls.tsx      # Input and filter controls
│   │   │   └── ChartBlock.tsx    # Chart rendering component
│   │   ├── queries/              # React Query hooks
│   │   │   ├── getIndustryData.ts
│   │   │   └── getCompanyData.ts
│   │   ├── utils/                # Utility functions
│   │   │   ├── transformToChartData.ts
│   │   │   ├── removeOutliers.ts
│   │   │   └── formatter.ts
│   │   ├── types/                # TypeScript type definitions
│   │   │   └── types.ts
│   │   ├── App.tsx               # Root component
│   │   ├── main.tsx              # Entry point
│   │   └── index.css             # Global styles
│   ├── vite.config.ts            # Vite configuration
│   ├── tsconfig.json             # TypeScript configuration
│   └── package.json              # Dependencies
├── run.py                        # Application entry point
├── requirements.txt              # Python dependencies
├── README.md                     # Documentation
└── .gitignore                    # Git ignore rules
```

## ✨ Features

### 🏢 Industry Analysis

- Enter an **industry name** (e.g., "Semiconductor Equipment")
- **AI agents** automatically identify leading companies
- Fetch **financial metrics** for all companies in the industry
- Compare **peer performance** over 1Y, 3Y, or 5Y periods

### 🏭 Company Comparison

- Enter a **company ticker** (e.g., "AAPL")
- Discover **competitors** and their industry classification
- Analyze **competitive positioning** with relevant metrics
- Highlight **specific competitors** for focused analysis

### 📊 Advanced Visualization

- **Multiple Chart Types:** Switch between line charts and stacked bar charts
- **Interactive Legend:** Click on company names to navigate to their competitor view
- **Outlier Filtering:** Remove statistical outliers (> 2σ from mean) per metric
- **Smart Color Coding:** Dynamic HSL color assignment for companies
- **Responsive Design:** Optimized for desktop, tablet, and mobile

### 🔄 Pagination & Performance

- **Lazy-load metrics** on scroll (6 metrics per batch, up to 2 batches)
- **Efficient data merging** prevents duplicate API calls
- **5-minute cache** for frequently requested data

### 🎨 UI/UX

- **Deep blue theme** with orange accent colors
- **Smooth transitions** and hover effects
- **Loading indicators** for all async operations
- **Error handling** with user-friendly messages
- **Form validation** and helpful input hints

## Prerequisites

Before running the application, obtain API keys from:

- [Financial Modeling Prep](https://financialmodelingprep.com/)
- [Finnhub](https://finnhub.io/)
- [Google Gemini](https://ai.google.dev/)
- [DeepSeek](https://platform.deepseek.com/)
- [Anthropic Claude](https://www.anthropic.com/)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/pifchina/vizgics
cd vizgics
```

### 2. Environment Setup

1. Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

2. Add your API keys to `.env`

### 3. Set Up Backend

```bash
# Create virtual environment
python -m venv venv
# Activate (Windows)
venv\Scripts\activate
# Activate (macOS/Linux)
source venv/bin/activate
# Install dependencies
pip install -r requirements.txt
```

### 4. Set Up Frontend

```bash
cd frontend
npm install
```

### 5. Run the Application

**Terminal 1 - Backend:**

```bash
# From project root
python run.py
```

Backend runs on `http://127.0.0.1:5000`

**Terminal 2 - Frontend:**

```bash
cd frontend
npm run dev
```

Frontend runs on `http://localhost:5173` (or displays the actual URL)

## 🔌 API Endpoints

### `/api/fmp-data` (Industry Comparison)

| Property   | Value |
| ---------- | ----- |
| **Method** | GET   |

**Query Parameters:**

- **industry** (required): Industry name (e.g., "Technology")
- **range** (optional): Time range - "1Y", "3Y", or "5Y" (default: "1Y")
- **limit** (optional): Metrics per batch (default: 6)
- **offset** (optional): Batch offset for pagination (default: 0)

**Response:**

```json
[
  {
    "ticker": "AAPL",
    "financials": {
      "revenue": [
        { "period": "2023-Q1", "value": 94000000000 },
        { "period": "2023-Q2", "value": 81160000000 }
      ],
      "grossProfit": [...],
      "netIncome": [...]
    }
  }
]
```

### `/api/competitors` (Company Comparison)

| Property   | Value |
| ---------- | ----- |
| **Method** | GET   |

**Query Parameters:**

- **ticker** (required): Company ticker (e.g., "AAPL")
- **range** (optional): Time range (default: "1Y")
- **limit** (optional): Metrics per batch (default: 6)
- **offset** (optional): Batch offset (default: 0)

**Response:**

```json
[
  {
    "ticker": "AAPL",
    "financials": {
      "revenue": [
        { "period": "2023-Q1", "value": 94000000000 },
        { "period": "2023-Q2", "value": 81160000000 }
      ],
      "grossProfit": [...],
      "netIncome": [...]
    }
  }
]
```

## 📊 Data Flow

1. **User Action:** Select industry or company
2. **Frontend:** Query hook triggers API call
3. **Backend:** Agent orchestration identifies relevant tickers & metrics
4. **Data Fetching:** FMP/yfinance APIs retrieve financials
5. **Transformation:** Raw data converted to chart format
6. **Filtering:** Outliers removed if toggled
7. **Visualization:** ECharts renders interactive chart
8. **Caching:** React Query caches results for **5 minutes**

## 📦 Dependencies

### Backend

See `requirements.txt`:

- **autogen==0.9.2**
- **Flask==3.1.1**
- **flask_cors==6.0.0**
- **flask_sqlalchemy==3.1.1**
- **yfinance==0.2.61**

### Frontend

See `package.json`:

- **React, React DOM, React Router**
- **Material UI** components & icons
- **ECharts** for visualizations
- **TanStack React Query** for data management
- **Axios** for HTTP requests
