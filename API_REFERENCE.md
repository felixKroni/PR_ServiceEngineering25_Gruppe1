# API Reference

## Base URL
```
http://localhost:8000
```

## Authentication
Currently uses basic user management. JWT tokens infrastructure is ready but not enforced in this version.

---

## Users API

### Create User
Create a new user account.

**Endpoint:** `POST /api/users/`

**Request Body:**
```json
{
  "username": "string",
  "email": "user@example.com",
  "password": "string"
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "username": "string",
  "email": "user@example.com",
  "created_at": "2025-01-01T00:00:00"
}
```

**Error Responses:**
- `400 Bad Request` - Email already registered or username taken
- `422 Unprocessable Entity` - Invalid input data

---

### Get User
Retrieve user details by ID.

**Endpoint:** `GET /api/users/{user_id}`

**Response:** `200 OK`
```json
{
  "id": 1,
  "username": "string",
  "email": "user@example.com",
  "created_at": "2025-01-01T00:00:00"
}
```

**Error Responses:**
- `404 Not Found` - User not found

---

## Portfolios API

### Create Portfolio
Create a new portfolio for a user.

**Endpoint:** `POST /api/portfolios/?user_id={user_id}`

**Request Body:**
```json
{
  "name": "string",
  "description": "string"
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "name": "string",
  "description": "string",
  "user_id": 1,
  "created_at": "2025-01-01T00:00:00",
  "updated_at": "2025-01-01T00:00:00"
}
```

---

### Get Portfolio
Retrieve portfolio details by ID.

**Endpoint:** `GET /api/portfolios/{portfolio_id}`

**Response:** `200 OK`
```json
{
  "id": 1,
  "name": "string",
  "description": "string",
  "user_id": 1,
  "created_at": "2025-01-01T00:00:00",
  "updated_at": "2025-01-01T00:00:00"
}
```

**Error Responses:**
- `404 Not Found` - Portfolio not found

---

### Get User Portfolios
Retrieve all portfolios for a specific user.

**Endpoint:** `GET /api/portfolios/user/{user_id}`

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "name": "string",
    "description": "string",
    "user_id": 1,
    "created_at": "2025-01-01T00:00:00",
    "updated_at": "2025-01-01T00:00:00"
  }
]
```

---

### Add Asset to Portfolio
Add an asset to a portfolio with purchase details.

**Endpoint:** `POST /api/portfolios/{portfolio_id}/assets`

**Query Parameters:**
- `asset_symbol` (string, required) - Asset ticker symbol
- `quantity` (float, required) - Number of shares
- `purchase_price` (float, required) - Price per share

**Response:** `200 OK`
```json
{
  "id": 1,
  "portfolio_id": 1,
  "asset_symbol": "AAPL",
  "transaction_type": "buy",
  "quantity": 10.0,
  "price": 150.00,
  "total_value": 1500.00,
  "transaction_date": "2025-01-01T00:00:00"
}
```

---

### Get Portfolio Holdings
Get current holdings in a portfolio.

**Endpoint:** `GET /api/portfolios/{portfolio_id}/holdings`

**Response:** `200 OK`
```json
{
  "portfolio_id": 1,
  "holdings": {
    "AAPL": {
      "quantity": 10.0,
      "total_cost": 1500.00
    },
    "GOOGL": {
      "quantity": 5.0,
      "total_cost": 14000.00
    }
  }
}
```

---

## Assets API

### Create Asset
Register a new asset in the system.

**Endpoint:** `POST /api/assets/`

**Request Body:**
```json
{
  "symbol": "AAPL",
  "name": "Apple Inc.",
  "asset_type": "stock",
  "sector": "Technology"
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "symbol": "AAPL",
  "name": "Apple Inc.",
  "asset_type": "stock",
  "sector": "Technology",
  "current_price": 150.00,
  "last_updated": "2025-01-01T00:00:00"
}
```

---

### Get Asset
Retrieve asset details by symbol.

**Endpoint:** `GET /api/assets/{symbol}`

**Response:** `200 OK`
```json
{
  "id": 1,
  "symbol": "AAPL",
  "name": "Apple Inc.",
  "asset_type": "stock",
  "sector": "Technology",
  "current_price": 150.00,
  "last_updated": "2025-01-01T00:00:00"
}
```

---

### List Assets
List all registered assets with pagination.

**Endpoint:** `GET /api/assets/`

**Query Parameters:**
- `skip` (integer, optional, default: 0) - Number of records to skip
- `limit` (integer, optional, default: 100) - Maximum records to return

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "symbol": "AAPL",
    "name": "Apple Inc.",
    "asset_type": "stock",
    "sector": "Technology",
    "current_price": 150.00,
    "last_updated": "2025-01-01T00:00:00"
  }
]
```

---

### Get Asset Price
Get current market price for an asset.

**Endpoint:** `GET /api/assets/{symbol}/price`

**Response:** `200 OK`
```json
{
  "symbol": "AAPL",
  "price": 150.00
}
```

---

### Get Asset Info
Get detailed information about an asset from market data.

**Endpoint:** `GET /api/assets/{symbol}/info`

**Response:** `200 OK`
```json
{
  "symbol": "AAPL",
  "name": "Apple Inc.",
  "sector": "Technology",
  "industry": "Consumer Electronics",
  "current_price": 150.00,
  "market_cap": 2500000000000,
  "pe_ratio": 28.5
}
```

---

## Analysis API (AI-Powered)

### Analyze Portfolio
Get AI-powered analysis of a portfolio.

**Endpoint:** `GET /api/analysis/{portfolio_id}`

**Response:** `200 OK`
```json
{
  "portfolio_id": 1,
  "total_value": 50000.00,
  "expected_return": 0.12,
  "volatility": 0.18,
  "sharpe_ratio": 0.56,
  "diversification_score": 0.75,
  "risk_level": "Medium",
  "recommendations": [
    "Consider increasing GOOGL allocation by 5.2%",
    "Consider decreasing AAPL allocation by 3.8%",
    "Portfolio is well-diversified"
  ]
}
```

**Metrics Explanation:**
- `total_value` - Current portfolio value in USD
- `expected_return` - Expected annual return (e.g., 0.12 = 12%)
- `volatility` - Portfolio volatility/risk (standard deviation)
- `sharpe_ratio` - Risk-adjusted return metric (higher is better)
- `diversification_score` - 0-1 scale (1 = perfectly diversified)
- `risk_level` - Low/Medium/High/Very High
- `recommendations` - AI-generated actionable insights

---

### Optimize Portfolio
Get AI-powered portfolio optimization recommendations.

**Endpoint:** `POST /api/analysis/optimize`

**Request Body:**
```json
{
  "portfolio_id": 1,
  "target_return": 0.15,
  "max_risk": 0.20
}
```

**Note:** `target_return` and `max_risk` are optional. If omitted, the system will optimize for maximum Sharpe ratio.

**Response:** `200 OK`
```json
{
  "current_allocation": {
    "AAPL": 0.30,
    "GOOGL": 0.25,
    "MSFT": 0.25,
    "AMZN": 0.20
  },
  "recommended_allocation": {
    "AAPL": 0.25,
    "GOOGL": 0.30,
    "MSFT": 0.28,
    "AMZN": 0.17
  },
  "expected_improvement": {
    "return_improvement": 0.02,
    "volatility_change": -0.01,
    "sharpe_improvement": 0.15
  },
  "risk_metrics": {
    "current_volatility": 0.18,
    "optimal_volatility": 0.17,
    "current_sharpe": 0.56,
    "optimal_sharpe": 0.71
  }
}
```

**Allocation Values:**
- Values are weights (sum to 1.0)
- Example: 0.30 = 30% of portfolio value

**Improvement Metrics:**
- `return_improvement` - Expected increase in annual return
- `volatility_change` - Change in portfolio risk (negative is good)
- `sharpe_improvement` - Improvement in risk-adjusted returns

---

## Error Responses

All endpoints may return these error responses:

### 400 Bad Request
```json
{
  "detail": "Error description"
}
```

### 404 Not Found
```json
{
  "detail": "Resource not found"
}
```

### 422 Unprocessable Entity
```json
{
  "detail": [
    {
      "loc": ["body", "field_name"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

### 500 Internal Server Error
```json
{
  "detail": "Internal server error"
}
```

---

## Rate Limiting

Currently no rate limiting is implemented. For production deployment, consider adding rate limiting middleware.

---

## Data Types

### Asset Types
- `stock` - Equity securities
- `bond` - Fixed income securities
- `etf` - Exchange-traded funds
- `crypto` - Cryptocurrencies
- `commodity` - Commodities
- `mutual_fund` - Mutual funds

### Transaction Types
- `buy` - Purchase transaction
- `sell` - Sale transaction

### Risk Levels
- `Low` - Volatility < 10%
- `Medium` - Volatility 10-20%
- `High` - Volatility 20-30%
- `Very High` - Volatility > 30%

---

## Best Practices

1. **Portfolio Creation**: Always create a portfolio before adding assets
2. **Asset Symbols**: Use standard ticker symbols (e.g., AAPL, GOOGL)
3. **Price Updates**: Asset prices are fetched from Yahoo Finance; ensure symbols are valid
4. **Analysis Frequency**: Don't analyze too frequently; market data changes are limited
5. **Optimization**: Run optimization after significant portfolio changes
6. **Holdings**: Maintain at least 3-5 different assets for meaningful diversification
