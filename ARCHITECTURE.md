# Architecture Documentation

## System Overview

The Portfolio Management with AI application is a modern, microservice-oriented system built with Python and FastAPI. It provides intelligent portfolio management capabilities powered by AI and Modern Portfolio Theory.

## Architecture Layers

### 1. Presentation Layer (API)
- **Framework**: FastAPI
- **Purpose**: RESTful API endpoints for client interactions
- **Components**:
  - `app/api/users.py` - User authentication and management
  - `app/api/portfolios.py` - Portfolio CRUD operations
  - `app/api/assets.py` - Asset management
  - `app/api/analysis.py` - AI-powered analysis and optimization

### 2. Business Logic Layer (Services)
- **Purpose**: Implement business rules and orchestration
- **Components**:
  - `app/services/portfolio_service.py` - Portfolio operations logic
  - `app/services/market_data.py` - Market data fetching and management

### 3. AI/ML Layer
- **Purpose**: Intelligent portfolio analysis and optimization
- **Components**:
  - `app/ai/optimizer.py` - Portfolio optimization engine
- **Algorithms**:
  - Modern Portfolio Theory (MPT)
  - Mean-Variance Optimization
  - Sharpe Ratio Maximization
  - Ledoit-Wolf Covariance Estimation

### 4. Data Layer
- **Database**: SQLAlchemy ORM with SQLite (production-ready for PostgreSQL)
- **Components**:
  - `app/models/database.py` - Database configuration
  - `app/models/models.py` - Data models

## Data Models

### User
- Primary entity for system users
- Fields: id, username, email, hashed_password, created_at
- Relationships: One-to-Many with Portfolio

### Portfolio
- Container for investment holdings
- Fields: id, name, description, user_id, created_at, updated_at
- Relationships: 
  - Many-to-One with User
  - Many-to-Many with Asset (through portfolio_assets)
  - One-to-Many with Transaction

### Asset
- Represents tradable securities
- Fields: id, symbol, name, asset_type, sector, current_price, last_updated
- Relationships: Many-to-Many with Portfolio

### Transaction
- Records buy/sell operations
- Fields: id, portfolio_id, asset_symbol, transaction_type, quantity, price, total_value, transaction_date
- Relationships: Many-to-One with Portfolio

## AI Components

### Portfolio Optimizer
The core AI engine implementing Modern Portfolio Theory:

1. **Returns Calculation**: Computes historical returns from price data
2. **Covariance Estimation**: Uses Ledoit-Wolf shrinkage for robust estimation
3. **Optimization**: SLSQP algorithm to maximize Sharpe ratio
4. **Risk Assessment**: Volatility-based risk classification
5. **Diversification Scoring**: Measures portfolio concentration
6. **Recommendations**: AI-generated actionable insights

### Key Algorithms

#### Mean-Variance Optimization
```
maximize: (Return - Risk_Free_Rate) / Volatility
subject to: Σ weights = 1, weights ≥ 0
```

#### Sharpe Ratio
```
Sharpe = (Portfolio_Return - Risk_Free_Rate) / Portfolio_Volatility
```

#### Diversification Score
```
Score = 1 - (Portfolio_Variance / Weighted_Average_Variance)
```

## API Design

### RESTful Principles
- Resource-based URLs
- HTTP verbs for operations
- JSON request/response
- Stateless communication

### Endpoint Categories

1. **Users** (`/api/users`)
   - POST / - Create user
   - GET /{user_id} - Get user details

2. **Portfolios** (`/api/portfolios`)
   - POST / - Create portfolio
   - GET /{portfolio_id} - Get portfolio
   - GET /user/{user_id} - List user portfolios
   - POST /{portfolio_id}/assets - Add asset
   - GET /{portfolio_id}/holdings - Get holdings

3. **Assets** (`/api/assets`)
   - POST / - Create asset
   - GET /{symbol} - Get asset
   - GET / - List assets
   - GET /{symbol}/price - Get price
   - GET /{symbol}/info - Get info

4. **Analysis** (`/api/analysis`)
   - GET /{portfolio_id} - Analyze portfolio
   - POST /optimize - Optimize allocation

## Data Flow

### Portfolio Analysis Flow
```
1. Client Request → API Endpoint
2. Fetch Portfolio Holdings → Database
3. Get Market Data → Yahoo Finance API
4. Calculate Returns → AI Engine
5. Compute Metrics → AI Engine
6. Generate Recommendations → AI Engine
7. Return Results → Client
```

### Portfolio Optimization Flow
```
1. Client Request → API Endpoint
2. Fetch Portfolio Data → Database
3. Get Historical Prices → Market Data Service
4. Calculate Covariance Matrix → AI Engine
5. Run Optimization Algorithm → AI Engine
6. Compare Current vs Optimal → AI Engine
7. Return Recommendations → Client
```

## Security

### Authentication
- Password hashing using bcrypt
- JWT tokens for session management (infrastructure ready)
- Secure password policies

### Data Protection
- SQL injection prevention (SQLAlchemy ORM)
- Input validation (Pydantic schemas)
- CORS configuration
- Environment-based secrets management

## Scalability Considerations

### Current Implementation
- SQLite database (suitable for development/small deployments)
- Synchronous API calls
- Single-server deployment

### Production Enhancements
1. **Database**: Migrate to PostgreSQL for better concurrency
2. **Caching**: Redis for market data and analysis results
3. **Async**: Convert to async/await for better throughput
4. **Load Balancing**: Deploy multiple API instances
5. **Message Queue**: Celery for background tasks (data fetching, optimization)
6. **CDN**: For static assets and documentation

## Testing Strategy

### Unit Tests
- Model validation
- Service logic
- AI algorithms

### Integration Tests
- API endpoints
- Database operations
- External service interactions

### Test Coverage
- Target: >80% code coverage
- Focus: Critical paths and AI algorithms

## Deployment

### Development
```bash
uvicorn app.main:app --reload
```

### Production
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Docker (Optional)
```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0"]
```

## Monitoring & Logging

### Logging
- FastAPI built-in logging
- Custom loggers for AI operations
- Request/response logging

### Metrics (Future)
- API response times
- Optimization execution times
- Database query performance
- Error rates

## Future Enhancements

1. **Real-time Updates**: WebSocket support for live portfolio values
2. **Advanced AI**: Deep learning models for price prediction
3. **Risk Management**: VaR (Value at Risk) calculations
4. **Backtesting**: Historical performance simulation
5. **Social Features**: Portfolio sharing and comparison
6. **Notifications**: Email/SMS alerts for portfolio changes
7. **Multi-currency**: Support for international markets
8. **Tax Optimization**: AI-driven tax loss harvesting

## Technology Stack Summary

| Component | Technology | Purpose |
|-----------|-----------|---------|
| API Framework | FastAPI | High-performance REST API |
| ORM | SQLAlchemy | Database abstraction |
| Database | SQLite/PostgreSQL | Data persistence |
| ML Library | scikit-learn | Portfolio optimization |
| Data Processing | pandas/NumPy | Financial calculations |
| Market Data | yfinance | Real-time/historical prices |
| Authentication | passlib | Password security |
| Testing | pytest | Automated testing |
| Documentation | OpenAPI | API documentation |

## Development Guidelines

### Code Style
- PEP 8 compliance
- Type hints for function signatures
- Docstrings for all public functions
- Meaningful variable names

### Git Workflow
- Feature branches
- Pull request reviews
- Commit message conventions
- Version tagging

### Error Handling
- HTTP exception handling
- Graceful degradation for external services
- Comprehensive error messages
- Logging of errors

## Conclusion

This architecture provides a solid foundation for a production-grade portfolio management system with AI capabilities. The modular design allows for easy extension and maintenance, while the AI components provide intelligent insights that add significant value beyond traditional portfolio management systems.
