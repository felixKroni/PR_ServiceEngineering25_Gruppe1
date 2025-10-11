# Portfolio Management with AI

An intelligent portfolio management system powered by AI for optimizing investment portfolios using Modern Portfolio Theory and machine learning.

## Features

- 🤖 **AI-Powered Portfolio Optimization**: Uses Modern Portfolio Theory with Ledoit-Wolf shrinkage for covariance estimation
- 📊 **Risk Assessment**: Automatic risk level classification and Sharpe ratio calculation
- 💹 **Real-time Market Data**: Integration with Yahoo Finance for live asset prices
- 📈 **Portfolio Analysis**: Calculate expected returns, volatility, and diversification scores
- 🎯 **Smart Recommendations**: AI-generated portfolio rebalancing suggestions
- 🔐 **User Management**: Secure user authentication and portfolio ownership
- 📉 **Transaction Tracking**: Complete transaction history for all portfolio activities
- 🌐 **RESTful API**: Clean and well-documented API endpoints

## Technology Stack

- **Backend**: FastAPI (Python 3.8+)
- **Database**: SQLAlchemy with SQLite (easily switchable to PostgreSQL)
- **AI/ML**: scikit-learn, NumPy, pandas, SciPy
- **Market Data**: yfinance
- **Authentication**: passlib with bcrypt
- **Testing**: pytest

## Installation

### Prerequisites

- Python 3.8 or higher
- pip (Python package manager)

### Setup

1. Clone the repository:
```bash
git clone https://github.com/felixKroni/PR_ServiceEngineering25_Gruppe1.git
cd PR_ServiceEngineering25_Gruppe1
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

5. Run the application:
```bash
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`

## API Documentation

Once the application is running, visit:
- **Interactive API docs**: http://localhost:8000/docs
- **Alternative docs**: http://localhost:8000/redoc

## Quick Start Guide

### 1. Create a User

```bash
curl -X POST "http://localhost:8000/api/users/" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "investor1",
    "email": "investor@example.com",
    "password": "securepassword"
  }'
```

### 2. Create a Portfolio

```bash
curl -X POST "http://localhost:8000/api/portfolios/?user_id=1" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Investment Portfolio",
    "description": "Diversified tech stocks"
  }'
```

### 3. Add Assets to Portfolio

```bash
curl -X POST "http://localhost:8000/api/portfolios/1/assets?asset_symbol=AAPL&quantity=10&purchase_price=150.00"
```

### 4. Analyze Portfolio (AI)

```bash
curl -X GET "http://localhost:8000/api/analysis/1"
```

### 5. Optimize Portfolio (AI)

```bash
curl -X POST "http://localhost:8000/api/analysis/optimize" \
  -H "Content-Type: application/json" \
  -d '{
    "portfolio_id": 1
  }'
```

## API Endpoints

### Users
- `POST /api/users/` - Create a new user
- `GET /api/users/{user_id}` - Get user details

### Portfolios
- `POST /api/portfolios/` - Create a new portfolio
- `GET /api/portfolios/{portfolio_id}` - Get portfolio details
- `GET /api/portfolios/user/{user_id}` - Get all user portfolios
- `POST /api/portfolios/{portfolio_id}/assets` - Add asset to portfolio
- `GET /api/portfolios/{portfolio_id}/holdings` - Get portfolio holdings

### Assets
- `POST /api/assets/` - Create a new asset
- `GET /api/assets/{symbol}` - Get asset details
- `GET /api/assets/` - List all assets
- `GET /api/assets/{symbol}/price` - Get current asset price
- `GET /api/assets/{symbol}/info` - Get detailed asset information

### Analysis (AI)
- `GET /api/analysis/{portfolio_id}` - AI-powered portfolio analysis
- `POST /api/analysis/optimize` - AI-powered portfolio optimization

## AI Features

### Portfolio Optimization

The system uses Modern Portfolio Theory (MPT) to optimize portfolio allocations:

- **Objective**: Maximize Sharpe ratio (risk-adjusted returns)
- **Covariance Estimation**: Ledoit-Wolf shrinkage estimator for robust covariance matrices
- **Optimization**: SLSQP (Sequential Least Squares Programming) algorithm
- **Constraints**: 
  - Weights sum to 1 (fully invested)
  - No short selling (weights ≥ 0)
  - Optional target return constraint

### Risk Assessment

The AI evaluates portfolio risk using:
- **Volatility**: Standard deviation of returns (annualized)
- **Sharpe Ratio**: Risk-adjusted return metric
- **Diversification Score**: Measures how well-diversified the portfolio is
- **Risk Classification**: Low, Medium, High, Very High

### Smart Recommendations

The system generates actionable recommendations:
- Asset allocation adjustments (buy/sell suggestions)
- Risk management advice
- Diversification improvements
- Performance optimization strategies

## Testing

Run the test suite:

```bash
pytest
```

Run with coverage:

```bash
pytest --cov=app tests/
```

## Example Usage

### Complete Workflow

```python
import requests

BASE_URL = "http://localhost:8000"

# 1. Create user
user = requests.post(f"{BASE_URL}/api/users/", json={
    "username": "john_doe",
    "email": "john@example.com",
    "password": "secure123"
}).json()

# 2. Create portfolio
portfolio = requests.post(
    f"{BASE_URL}/api/portfolios/?user_id={user['id']}", 
    json={
        "name": "Tech Portfolio",
        "description": "Technology sector investments"
    }
).json()

# 3. Add multiple assets
assets = [
    ("AAPL", 10, 150.0),
    ("GOOGL", 5, 2800.0),
    ("MSFT", 8, 350.0),
    ("AMZN", 3, 3300.0)
]

for symbol, quantity, price in assets:
    requests.post(
        f"{BASE_URL}/api/portfolios/{portfolio['id']}/assets",
        params={
            "asset_symbol": symbol,
            "quantity": quantity,
            "purchase_price": price
        }
    )

# 4. Get AI analysis
analysis = requests.get(
    f"{BASE_URL}/api/analysis/{portfolio['id']}"
).json()

print(f"Portfolio Value: ${analysis['total_value']:.2f}")
print(f"Expected Return: {analysis['expected_return']*100:.2f}%")
print(f"Volatility: {analysis['volatility']*100:.2f}%")
print(f"Sharpe Ratio: {analysis['sharpe_ratio']:.2f}")
print(f"Risk Level: {analysis['risk_level']}")
print("\nRecommendations:")
for rec in analysis['recommendations']:
    print(f"  - {rec}")

# 5. Optimize portfolio
optimization = requests.post(
    f"{BASE_URL}/api/analysis/optimize",
    json={"portfolio_id": portfolio['id']}
).json()

print("\nOptimization Results:")
print("Current Allocation:", optimization['current_allocation'])
print("Recommended Allocation:", optimization['recommended_allocation'])
print("Expected Improvement:", optimization['expected_improvement'])
```

## Project Structure

```
PR_ServiceEngineering25_Gruppe1/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI application entry point
│   ├── models/
│   │   ├── __init__.py
│   │   ├── database.py         # Database configuration
│   │   └── models.py           # SQLAlchemy models
│   ├── schemas/
│   │   ├── __init__.py
│   │   └── schemas.py          # Pydantic schemas
│   ├── api/
│   │   ├── __init__.py
│   │   ├── users.py            # User endpoints
│   │   ├── portfolios.py       # Portfolio endpoints
│   │   ├── assets.py           # Asset endpoints
│   │   └── analysis.py         # AI analysis endpoints
│   ├── services/
│   │   ├── __init__.py
│   │   ├── market_data.py      # Market data service
│   │   └── portfolio_service.py # Portfolio business logic
│   └── ai/
│       ├── __init__.py
│       └── optimizer.py        # AI optimization engine
├── tests/
│   ├── __init__.py
│   ├── test_api.py            # API tests
│   └── test_ai.py             # AI tests
├── requirements.txt           # Python dependencies
├── .env.example              # Environment variables template
├── .gitignore
└── README.md
```

## Configuration

Edit `.env` file to configure:

```env
DATABASE_URL=sqlite:///./portfolio.db  # Database connection
SECRET_KEY=your-secret-key              # JWT secret
ALGORITHM=HS256                         # JWT algorithm
ACCESS_TOKEN_EXPIRE_MINUTES=30          # Token expiration
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Authors

- Team Gruppe 1 - Service Engineering 2025

## Acknowledgments

- Modern Portfolio Theory by Harry Markowitz
- FastAPI framework
- scikit-learn machine learning library
- Yahoo Finance for market data
