"""Portfolio management endpoints"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.models.database import get_db
from app.models.models import Portfolio
from app.schemas import schemas
from app.services.portfolio_service import PortfolioService

router = APIRouter()

@router.post("/", response_model=schemas.Portfolio, status_code=status.HTTP_201_CREATED)
def create_portfolio(
    portfolio: schemas.PortfolioCreate,
    user_id: int,
    db: Session = Depends(get_db)
):
    """Create a new portfolio"""
    return PortfolioService.create_portfolio(db, portfolio, user_id)

@router.get("/{portfolio_id}", response_model=schemas.Portfolio)
def get_portfolio(portfolio_id: int, db: Session = Depends(get_db)):
    """Get portfolio by ID"""
    portfolio = PortfolioService.get_portfolio(db, portfolio_id)
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    return portfolio

@router.get("/user/{user_id}", response_model=List[schemas.Portfolio])
def get_user_portfolios(user_id: int, db: Session = Depends(get_db)):
    """Get all portfolios for a user"""
    return PortfolioService.get_user_portfolios(db, user_id)

@router.post("/{portfolio_id}/assets", response_model=schemas.Transaction)
def add_asset_to_portfolio(
    portfolio_id: int,
    asset_symbol: str,
    quantity: float,
    purchase_price: float,
    db: Session = Depends(get_db)
):
    """Add an asset to a portfolio"""
    portfolio = PortfolioService.get_portfolio(db, portfolio_id)
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    return PortfolioService.add_asset_to_portfolio(
        db, portfolio_id, asset_symbol, quantity, purchase_price
    )

@router.get("/{portfolio_id}/holdings")
def get_portfolio_holdings(portfolio_id: int, db: Session = Depends(get_db)):
    """Get current holdings in a portfolio"""
    portfolio = PortfolioService.get_portfolio(db, portfolio_id)
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    holdings = PortfolioService.get_portfolio_holdings(db, portfolio_id)
    return {"portfolio_id": portfolio_id, "holdings": holdings}
