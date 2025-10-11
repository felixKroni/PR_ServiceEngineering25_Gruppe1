"""Portfolio service for business logic"""
from sqlalchemy.orm import Session
from app.models.models import Portfolio, Asset, Transaction
from app.schemas import schemas
from typing import List, Optional
from datetime import datetime

class PortfolioService:
    """Service for portfolio operations"""
    
    @staticmethod
    def create_portfolio(db: Session, portfolio: schemas.PortfolioCreate, 
                        user_id: int) -> Portfolio:
        """Create a new portfolio"""
        db_portfolio = Portfolio(
            name=portfolio.name,
            description=portfolio.description,
            user_id=user_id
        )
        db.add(db_portfolio)
        db.commit()
        db.refresh(db_portfolio)
        return db_portfolio
    
    @staticmethod
    def get_portfolio(db: Session, portfolio_id: int) -> Optional[Portfolio]:
        """Get portfolio by ID"""
        return db.query(Portfolio).filter(Portfolio.id == portfolio_id).first()
    
    @staticmethod
    def get_user_portfolios(db: Session, user_id: int) -> List[Portfolio]:
        """Get all portfolios for a user"""
        return db.query(Portfolio).filter(Portfolio.user_id == user_id).all()
    
    @staticmethod
    def add_asset_to_portfolio(db: Session, portfolio_id: int, 
                              asset_symbol: str, quantity: float, 
                              purchase_price: float) -> Transaction:
        """Add an asset to a portfolio"""
        # Create transaction record
        transaction = Transaction(
            portfolio_id=portfolio_id,
            asset_symbol=asset_symbol,
            transaction_type="buy",
            quantity=quantity,
            price=purchase_price,
            total_value=quantity * purchase_price
        )
        db.add(transaction)
        db.commit()
        db.refresh(transaction)
        return transaction
    
    @staticmethod
    def get_portfolio_value(db: Session, portfolio_id: int, 
                           asset_prices: dict) -> float:
        """Calculate total portfolio value"""
        transactions = db.query(Transaction).filter(
            Transaction.portfolio_id == portfolio_id
        ).all()
        
        holdings = {}
        for tx in transactions:
            if tx.asset_symbol not in holdings:
                holdings[tx.asset_symbol] = 0
            
            if tx.transaction_type == "buy":
                holdings[tx.asset_symbol] += tx.quantity
            elif tx.transaction_type == "sell":
                holdings[tx.asset_symbol] -= tx.quantity
        
        total_value = 0
        for symbol, quantity in holdings.items():
            if quantity > 0 and symbol in asset_prices:
                total_value += quantity * asset_prices[symbol]
        
        return total_value
    
    @staticmethod
    def get_portfolio_holdings(db: Session, portfolio_id: int) -> dict:
        """Get current holdings in a portfolio"""
        transactions = db.query(Transaction).filter(
            Transaction.portfolio_id == portfolio_id
        ).all()
        
        holdings = {}
        for tx in transactions:
            if tx.asset_symbol not in holdings:
                holdings[tx.asset_symbol] = {
                    'quantity': 0,
                    'total_cost': 0
                }
            
            if tx.transaction_type == "buy":
                holdings[tx.asset_symbol]['quantity'] += tx.quantity
                holdings[tx.asset_symbol]['total_cost'] += tx.total_value
            elif tx.transaction_type == "sell":
                holdings[tx.asset_symbol]['quantity'] -= tx.quantity
                holdings[tx.asset_symbol]['total_cost'] -= tx.total_value
        
        # Remove holdings with 0 quantity
        holdings = {k: v for k, v in holdings.items() if v['quantity'] > 0}
        return holdings
