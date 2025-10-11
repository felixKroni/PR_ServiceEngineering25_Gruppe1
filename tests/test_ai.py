"""Tests for AI portfolio optimizer"""
import pytest
import numpy as np
import pandas as pd
from app.ai.optimizer import PortfolioOptimizer

def test_portfolio_optimizer_init():
    """Test optimizer initialization"""
    optimizer = PortfolioOptimizer()
    assert optimizer.risk_free_rate == 0.02

def test_calculate_returns():
    """Test returns calculation"""
    optimizer = PortfolioOptimizer()
    
    # Create sample price data
    prices = pd.DataFrame({
        'AAPL': [100, 105, 103, 108],
        'GOOGL': [1000, 1020, 1010, 1040]
    })
    
    returns = optimizer.calculate_returns(prices)
    assert len(returns) == 3  # One less than prices due to pct_change
    assert 'AAPL' in returns.columns
    assert 'GOOGL' in returns.columns

def test_expected_returns():
    """Test expected returns calculation"""
    optimizer = PortfolioOptimizer()
    
    returns = pd.DataFrame({
        'AAPL': [0.01, 0.02, -0.01],
        'GOOGL': [0.015, 0.01, 0.02]
    })
    
    expected = optimizer.calculate_expected_returns(returns)
    assert len(expected) == 2
    assert isinstance(expected, np.ndarray)

def test_portfolio_performance():
    """Test portfolio performance calculation"""
    optimizer = PortfolioOptimizer()
    
    weights = np.array([0.5, 0.5])
    expected_returns = np.array([0.001, 0.0015])
    cov_matrix = np.array([[0.0004, 0.0001], [0.0001, 0.0005]])
    
    ret, vol, sharpe = optimizer.portfolio_performance(weights, expected_returns, cov_matrix)
    
    assert ret > 0
    assert vol > 0
    assert isinstance(sharpe, (float, np.floating))

def test_risk_assessment():
    """Test risk level assessment"""
    optimizer = PortfolioOptimizer()
    
    assert optimizer.assess_risk_level(0.05) == "Low"
    assert optimizer.assess_risk_level(0.15) == "Medium"
    assert optimizer.assess_risk_level(0.25) == "High"
    assert optimizer.assess_risk_level(0.35) == "Very High"

def test_diversification_score():
    """Test diversification score calculation"""
    optimizer = PortfolioOptimizer()
    
    weights = np.array([0.25, 0.25, 0.25, 0.25])
    cov_matrix = np.array([
        [0.0004, 0.0001, 0.0001, 0.0001],
        [0.0001, 0.0005, 0.0001, 0.0001],
        [0.0001, 0.0001, 0.0004, 0.0001],
        [0.0001, 0.0001, 0.0001, 0.0006]
    ])
    
    score = optimizer.calculate_diversification_score(weights, cov_matrix)
    assert 0 <= score <= 1
