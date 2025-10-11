# Getting Started with Portfolio Management AI

This guide will help you get up and running with the Portfolio Management Application.

## Prerequisites

- Python 3.8 or higher
- pip (Python package manager)
- Git (for cloning the repository)

## Installation

### Step 1: Clone the Repository

```bash
git clone https://github.com/felixKroni/PR_ServiceEngineering25_Gruppe1.git
cd PR_ServiceEngineering25_Gruppe1
```

### Step 2: Create Virtual Environment

**On Linux/Mac:**
```bash
python3 -m venv venv
source venv/bin/activate
```

**On Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

### Step 3: Install Dependencies

```bash
pip install -r requirements.txt
```

This will install:
- FastAPI and Uvicorn (API framework)
- SQLAlchemy (Database ORM)
- NumPy, pandas, scikit-learn (AI/ML libraries)
- yfinance (Market data)
- And other dependencies

### Step 4: Configure Environment

```bash
cp .env.example .env
```

Edit `.env` if needed (default values work for development).

### Step 5: Start the Server

**Option 1: Using uvicorn directly**
```bash
uvicorn app.main:app --reload
```

**Option 2: Using the run script**
```bash
python run.py
```

The server will start at `http://localhost:8000`

### Step 6: Verify Installation

Open your browser and visit:
- API Documentation: http://localhost:8000/docs
- Alternative docs: http://localhost:8000/redoc
- Health check: http://localhost:8000/health

You should see the interactive API documentation.

## Quick Start Tutorial

### 1. Run the Demo

The easiest way to see the system in action:

```bash
python demo.py
```

This will:
1. Create a demo user
2. Create a portfolio
3. Add several tech stocks
4. Run AI analysis
5. Get optimization recommendations

### 2. Use the Interactive API

Visit http://localhost:8000/docs and try these steps:

#### Create a User

1. Expand `POST /api/users/`
2. Click "Try it out"
3. Enter:
```json
{
  "username": "myusername",
  "email": "my@email.com",
  "password": "mypassword123"
}
```
4. Click "Execute"
5. Note the `id` in the response (you'll need it)

#### Create a Portfolio

1. Expand `POST /api/portfolios/`
2. Click "Try it out"
3. Enter the user_id from previous step
4. Enter portfolio details:
```json
{
  "name": "My Tech Portfolio",
  "description": "Technology sector investments"
}
```
5. Note the portfolio `id`

#### Add Assets to Portfolio

1. Expand `POST /api/portfolios/{portfolio_id}/assets`
2. Enter your portfolio_id
3. Enter asset details:
   - asset_symbol: `AAPL`
   - quantity: `10`
   - purchase_price: `150.00`
4. Repeat for more assets (GOOGL, MSFT, etc.)

#### Analyze Portfolio (AI)

1. Expand `GET /api/analysis/{portfolio_id}`
2. Enter your portfolio_id
3. Click "Execute"
4. View AI-generated insights:
   - Expected return
   - Risk level
   - Sharpe ratio
   - Recommendations

#### Optimize Portfolio (AI)

1. Expand `POST /api/analysis/optimize`
2. Enter:
```json
{
  "portfolio_id": 1
}
```
3. View optimal allocation recommendations

### 3. Use with Python Requests

```python
import requests

BASE_URL = "http://localhost:8000"

# Create user
user = requests.post(f"{BASE_URL}/api/users/", json={
    "username": "investor1",
    "email": "investor@example.com",
    "password": "secure123"
}).json()

print(f"Created user: {user['username']} (ID: {user['id']})")

# Create portfolio
portfolio = requests.post(
    f"{BASE_URL}/api/portfolios/?user_id={user['id']}", 
    json={
        "name": "Growth Portfolio",
        "description": "High-growth tech stocks"
    }
).json()

print(f"Created portfolio: {portfolio['name']} (ID: {portfolio['id']})")

# Add assets
assets = [
    ("AAPL", 15, 150.0),
    ("GOOGL", 8, 2800.0),
    ("MSFT", 12, 350.0),
]

for symbol, qty, price in assets:
    response = requests.post(
        f"{BASE_URL}/api/portfolios/{portfolio['id']}/assets",
        params={
            "asset_symbol": symbol,
            "quantity": qty,
            "purchase_price": price
        }
    )
    print(f"Added {qty} shares of {symbol}")

# Get AI analysis
analysis = requests.get(
    f"{BASE_URL}/api/analysis/{portfolio['id']}"
).json()

print("\nPortfolio Analysis:")
print(f"Total Value: ${analysis['total_value']:,.2f}")
print(f"Expected Return: {analysis['expected_return']*100:.2f}%")
print(f"Volatility: {analysis['volatility']*100:.2f}%")
print(f"Sharpe Ratio: {analysis['sharpe_ratio']:.2f}")
print(f"Risk Level: {analysis['risk_level']}")
print("\nRecommendations:")
for rec in analysis['recommendations']:
    print(f"  • {rec}")
```

### 4. Use with curl

```bash
# Create user
curl -X POST "http://localhost:8000/api/users/" \
  -H "Content-Type: application/json" \
  -d '{"username":"trader1","email":"trader@test.com","password":"pass123"}'

# Create portfolio (use user_id from above)
curl -X POST "http://localhost:8000/api/portfolios/?user_id=1" \
  -H "Content-Type: application/json" \
  -d '{"name":"My Portfolio","description":"Test portfolio"}'

# Add asset
curl -X POST "http://localhost:8000/api/portfolios/1/assets?asset_symbol=AAPL&quantity=10&purchase_price=150"

# Get analysis
curl -X GET "http://localhost:8000/api/analysis/1"
```

## Understanding the Results

### Portfolio Analysis Output

```json
{
  "portfolio_id": 1,
  "total_value": 50000.00,
  "expected_return": 0.12,      // 12% annual return
  "volatility": 0.18,            // 18% volatility (risk)
  "sharpe_ratio": 0.56,          // Risk-adjusted return
  "diversification_score": 0.75, // 0-1 scale (higher is better)
  "risk_level": "Medium",        // Risk classification
  "recommendations": [...]       // AI-generated suggestions
}
```

### Understanding Metrics

- **Expected Return**: Projected annual return (higher is better)
- **Volatility**: Risk measure, standard deviation of returns (lower is better)
- **Sharpe Ratio**: Return per unit of risk (higher is better, >1 is good)
- **Diversification Score**: 0-1, measures concentration (1 = perfectly diversified)
- **Risk Level**: Low/Medium/High/Very High based on volatility

### Portfolio Optimization Output

```json
{
  "current_allocation": {
    "AAPL": 0.30,    // 30% of portfolio
    "GOOGL": 0.40,
    "MSFT": 0.30
  },
  "recommended_allocation": {
    "AAPL": 0.25,
    "GOOGL": 0.45,
    "MSFT": 0.30
  },
  "expected_improvement": {
    "return_improvement": 0.02,      // +2% return
    "volatility_change": -0.01,      // -1% risk
    "sharpe_improvement": 0.15       // Better risk-adjusted return
  }
}
```

## Common Asset Symbols

Here are some popular symbols to try:

**Tech Stocks:**
- AAPL (Apple)
- GOOGL (Google)
- MSFT (Microsoft)
- AMZN (Amazon)
- NVDA (NVIDIA)
- META (Meta/Facebook)
- TSLA (Tesla)

**ETFs:**
- SPY (S&P 500)
- QQQ (NASDAQ 100)
- VTI (Total Stock Market)

**Note:** Symbols must be valid Yahoo Finance tickers.

## Troubleshooting

### Server won't start

**Issue:** Import errors
**Solution:** Ensure all dependencies are installed:
```bash
pip install -r requirements.txt
```

### Market data not loading

**Issue:** yfinance connection timeout
**Solution:** 
- Check internet connection
- Verify asset symbols are correct
- Try again (Yahoo Finance may have rate limits)

### Database errors

**Issue:** Database locked or connection errors
**Solution:** Delete `portfolio.db` and restart:
```bash
rm portfolio.db
python run.py
```

### Port already in use

**Issue:** Port 8000 is already in use
**Solution:** Use a different port:
```bash
uvicorn app.main:app --port 8001
```

## Running Tests

```bash
# Run all tests
pytest

# Run with output
pytest -v

# Run specific test file
pytest tests/test_api.py

# Run with coverage
pytest --cov=app tests/
```

## Docker Deployment

### Build and run with Docker

```bash
# Build image
docker build -t portfolio-ai .

# Run container
docker run -p 8000:8000 portfolio-ai
```

### Using docker-compose

```bash
# Start services
docker-compose up

# Stop services
docker-compose down
```

## Next Steps

1. **Explore the API**: Visit http://localhost:8000/docs
2. **Read Documentation**: Check out API_REFERENCE.md and ARCHITECTURE.md
3. **Try Different Portfolios**: Experiment with various asset combinations
4. **Understand AI Recommendations**: See how optimization changes with different holdings
5. **Build Something**: Use the API to build your own portfolio tracker

## Learning Resources

### Modern Portfolio Theory
- [Investopedia: Modern Portfolio Theory](https://www.investopedia.com/terms/m/modernportfoliotheory.asp)
- [Wikipedia: Sharpe Ratio](https://en.wikipedia.org/wiki/Sharpe_ratio)

### FastAPI
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [FastAPI Tutorial](https://fastapi.tiangolo.com/tutorial/)

### Machine Learning in Finance
- [Quantitative Finance with Python](https://www.quantstart.com/)
- [Financial Machine Learning](https://www.mlfinlab.com/)

## Support

- **Documentation**: See README.md, API_REFERENCE.md, ARCHITECTURE.md
- **Issues**: Report bugs on GitHub
- **Questions**: Open a GitHub issue with the "question" label

## What's Next?

After getting comfortable with the basics:
- Try optimizing portfolios with target returns
- Experiment with different asset types
- Build a frontend interface
- Integrate with your own data sources
- Add custom AI models

Happy investing! 🚀📈
