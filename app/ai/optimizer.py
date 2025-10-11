"""AI-powered portfolio analysis and optimization"""
import numpy as np
import pandas as pd
from typing import Dict, List, Tuple
from sklearn.covariance import LedoitWolf
from scipy.optimize import minimize

class PortfolioOptimizer:
    """Portfolio optimization using Modern Portfolio Theory and AI"""
    
    def __init__(self):
        self.risk_free_rate = 0.02  # 2% risk-free rate
    
    def calculate_returns(self, prices: pd.DataFrame) -> pd.DataFrame:
        """Calculate returns from price data"""
        return prices.pct_change().dropna()
    
    def calculate_expected_returns(self, returns: pd.DataFrame) -> np.ndarray:
        """Calculate expected returns using mean historical returns"""
        return returns.mean().values
    
    def calculate_covariance_matrix(self, returns: pd.DataFrame) -> np.ndarray:
        """Calculate covariance matrix using Ledoit-Wolf shrinkage"""
        lw = LedoitWolf()
        cov_matrix, _ = lw.fit(returns).covariance_, None
        return cov_matrix
    
    def portfolio_performance(self, weights: np.ndarray, expected_returns: np.ndarray, 
                            cov_matrix: np.ndarray) -> Tuple[float, float, float]:
        """Calculate portfolio performance metrics"""
        portfolio_return = np.sum(weights * expected_returns) * 252  # Annualized
        portfolio_std = np.sqrt(np.dot(weights.T, np.dot(cov_matrix, weights))) * np.sqrt(252)
        sharpe_ratio = (portfolio_return - self.risk_free_rate) / portfolio_std
        return portfolio_return, portfolio_std, sharpe_ratio
    
    def negative_sharpe(self, weights: np.ndarray, expected_returns: np.ndarray, 
                       cov_matrix: np.ndarray) -> float:
        """Objective function to minimize (negative Sharpe ratio)"""
        _, _, sharpe = self.portfolio_performance(weights, expected_returns, cov_matrix)
        return -sharpe
    
    def optimize_portfolio(self, returns: pd.DataFrame, 
                          target_return: float = None) -> Dict:
        """Optimize portfolio allocation"""
        n_assets = len(returns.columns)
        expected_returns = self.calculate_expected_returns(returns)
        cov_matrix = self.calculate_covariance_matrix(returns)
        
        # Constraints and bounds
        constraints = [{'type': 'eq', 'fun': lambda x: np.sum(x) - 1}]
        if target_return is not None:
            constraints.append({
                'type': 'eq',
                'fun': lambda x: self.portfolio_performance(x, expected_returns, cov_matrix)[0] - target_return
            })
        
        bounds = tuple((0, 1) for _ in range(n_assets))
        initial_weights = np.array([1/n_assets] * n_assets)
        
        # Optimize
        result = minimize(
            self.negative_sharpe,
            initial_weights,
            args=(expected_returns, cov_matrix),
            method='SLSQP',
            bounds=bounds,
            constraints=constraints
        )
        
        optimal_weights = result.x
        ret, vol, sharpe = self.portfolio_performance(optimal_weights, expected_returns, cov_matrix)
        
        return {
            'weights': dict(zip(returns.columns, optimal_weights)),
            'expected_return': ret,
            'volatility': vol,
            'sharpe_ratio': sharpe
        }
    
    def calculate_diversification_score(self, weights: np.ndarray, 
                                       cov_matrix: np.ndarray) -> float:
        """Calculate diversification score (0-1, higher is better)"""
        portfolio_variance = np.dot(weights.T, np.dot(cov_matrix, weights))
        weighted_avg_variance = np.dot(weights**2, np.diag(cov_matrix))
        if weighted_avg_variance == 0:
            return 0.0
        diversification_ratio = 1 - (portfolio_variance / weighted_avg_variance)
        return max(0, min(1, diversification_ratio))
    
    def assess_risk_level(self, volatility: float) -> str:
        """Assess risk level based on volatility"""
        if volatility < 0.10:
            return "Low"
        elif volatility < 0.20:
            return "Medium"
        elif volatility < 0.30:
            return "High"
        else:
            return "Very High"
    
    def generate_recommendations(self, current_allocation: Dict[str, float],
                                optimal_allocation: Dict[str, float],
                                risk_level: str) -> List[str]:
        """Generate portfolio recommendations"""
        recommendations = []
        
        # Compare allocations
        for symbol in optimal_allocation:
            current = current_allocation.get(symbol, 0)
            optimal = optimal_allocation[symbol]
            diff = optimal - current
            
            if abs(diff) > 0.05:  # 5% threshold
                if diff > 0:
                    recommendations.append(
                        f"Consider increasing {symbol} allocation by {diff*100:.1f}%"
                    )
                else:
                    recommendations.append(
                        f"Consider decreasing {symbol} allocation by {abs(diff)*100:.1f}%"
                    )
        
        # Risk-based recommendations
        if risk_level == "Very High":
            recommendations.append("Consider adding more stable assets to reduce risk")
        elif risk_level == "Low":
            recommendations.append("Portfolio is conservative; consider growth opportunities")
        
        # Diversification recommendations
        if len(current_allocation) < 5:
            recommendations.append("Consider diversifying across more assets")
        
        return recommendations[:5]  # Return top 5 recommendations
