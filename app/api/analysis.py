"""AI-powered portfolio analysis endpoints"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.models.database import get_db
from app.schemas import schemas
from app.services.portfolio_service import PortfolioService
from app.services.market_data import MarketDataService
from app.ai.optimizer import PortfolioOptimizer
import numpy as np
import pandas as pd

router = APIRouter()

@router.get("/{portfolio_id}", response_model=schemas.PortfolioAnalysis)
def analyze_portfolio(portfolio_id: int, db: Session = Depends(get_db)):
    """Analyze a portfolio using AI"""
    portfolio = PortfolioService.get_portfolio(db, portfolio_id)
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    # Get holdings
    holdings = PortfolioService.get_portfolio_holdings(db, portfolio_id)
    if not holdings:
        raise HTTPException(status_code=400, detail="Portfolio has no holdings")
    
    symbols = list(holdings.keys())
    
    # Get current prices
    prices = MarketDataService.update_asset_prices(symbols)
    
    # Calculate portfolio value
    total_value = sum(
        holdings[symbol]['quantity'] * prices.get(symbol, 0)
        for symbol in symbols
    )
    
    # Get historical data for analysis
    historical_data = MarketDataService.get_historical_prices(symbols, period="1y")
    
    if historical_data.empty:
        raise HTTPException(status_code=400, detail="Unable to fetch historical data")
    
    # Calculate weights
    weights = np.array([
        holdings[symbol]['quantity'] * prices.get(symbol, 0) / total_value
        for symbol in symbols
    ])
    
    # Perform AI analysis
    optimizer = PortfolioOptimizer()
    returns = optimizer.calculate_returns(historical_data)
    expected_returns = optimizer.calculate_expected_returns(returns)
    cov_matrix = optimizer.calculate_covariance_matrix(returns)
    
    # Calculate metrics
    portfolio_return, volatility, sharpe_ratio = optimizer.portfolio_performance(
        weights, expected_returns, cov_matrix
    )
    
    diversification_score = optimizer.calculate_diversification_score(weights, cov_matrix)
    risk_level = optimizer.assess_risk_level(volatility)
    
    # Get optimal allocation
    optimal = optimizer.optimize_portfolio(returns)
    
    # Generate recommendations
    current_allocation = {symbol: float(w) for symbol, w in zip(symbols, weights)}
    recommendations = optimizer.generate_recommendations(
        current_allocation, optimal['weights'], risk_level
    )
    
    return schemas.PortfolioAnalysis(
        portfolio_id=portfolio_id,
        total_value=total_value,
        expected_return=float(portfolio_return),
        volatility=float(volatility),
        sharpe_ratio=float(sharpe_ratio),
        diversification_score=float(diversification_score),
        risk_level=risk_level,
        recommendations=recommendations
    )

@router.post("/optimize", response_model=schemas.OptimizationResult)
def optimize_portfolio(
    request: schemas.OptimizationRequest,
    db: Session = Depends(get_db)
):
    """Optimize portfolio allocation using AI"""
    portfolio = PortfolioService.get_portfolio(db, request.portfolio_id)
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    # Get holdings
    holdings = PortfolioService.get_portfolio_holdings(db, request.portfolio_id)
    if not holdings:
        raise HTTPException(status_code=400, detail="Portfolio has no holdings")
    
    symbols = list(holdings.keys())
    prices = MarketDataService.update_asset_prices(symbols)
    
    # Calculate current allocation
    total_value = sum(
        holdings[symbol]['quantity'] * prices.get(symbol, 0)
        for symbol in symbols
    )
    
    current_allocation = {
        symbol: holdings[symbol]['quantity'] * prices.get(symbol, 0) / total_value
        for symbol in symbols
    }
    
    # Get historical data
    historical_data = MarketDataService.get_historical_prices(symbols, period="1y")
    
    if historical_data.empty:
        raise HTTPException(status_code=400, detail="Unable to fetch historical data")
    
    # Optimize
    optimizer = PortfolioOptimizer()
    optimal = optimizer.optimize_portfolio(
        optimizer.calculate_returns(historical_data),
        target_return=request.target_return
    )
    
    # Calculate improvements
    returns = optimizer.calculate_returns(historical_data)
    expected_returns = optimizer.calculate_expected_returns(returns)
    cov_matrix = optimizer.calculate_covariance_matrix(returns)
    
    current_weights = np.array([current_allocation[s] for s in symbols])
    current_ret, current_vol, current_sharpe = optimizer.portfolio_performance(
        current_weights, expected_returns, cov_matrix
    )
    
    improvement = {
        'return_improvement': float(optimal['expected_return'] - current_ret),
        'volatility_change': float(optimal['volatility'] - current_vol),
        'sharpe_improvement': float(optimal['sharpe_ratio'] - current_sharpe)
    }
    
    risk_metrics = {
        'current_volatility': float(current_vol),
        'optimal_volatility': float(optimal['volatility']),
        'current_sharpe': float(current_sharpe),
        'optimal_sharpe': float(optimal['sharpe_ratio'])
    }
    
    return schemas.OptimizationResult(
        current_allocation=current_allocation,
        recommended_allocation=optimal['weights'],
        expected_improvement=improvement,
        risk_metrics=risk_metrics
    )
