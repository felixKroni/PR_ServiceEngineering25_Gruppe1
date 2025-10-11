"""Pydantic schemas for request/response validation"""
from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List

# User schemas
class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Asset schemas
class AssetBase(BaseModel):
    symbol: str
    name: str
    asset_type: str
    sector: Optional[str] = None

class AssetCreate(AssetBase):
    pass

class Asset(AssetBase):
    id: int
    current_price: float
    last_updated: datetime
    
    class Config:
        from_attributes = True

# Portfolio schemas
class PortfolioBase(BaseModel):
    name: str
    description: Optional[str] = None

class PortfolioCreate(PortfolioBase):
    pass

class Portfolio(PortfolioBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class PortfolioWithAssets(Portfolio):
    assets: List[Asset] = []

# Transaction schemas
class TransactionBase(BaseModel):
    asset_symbol: str
    transaction_type: str
    quantity: float
    price: float

class TransactionCreate(TransactionBase):
    portfolio_id: int

class Transaction(TransactionBase):
    id: int
    portfolio_id: int
    total_value: float
    transaction_date: datetime
    
    class Config:
        from_attributes = True

# AI Analysis schemas
class PortfolioAnalysis(BaseModel):
    portfolio_id: int
    total_value: float
    expected_return: float
    volatility: float
    sharpe_ratio: float
    diversification_score: float
    risk_level: str
    recommendations: List[str]

class OptimizationRequest(BaseModel):
    portfolio_id: int
    target_return: Optional[float] = None
    max_risk: Optional[float] = None

class OptimizationResult(BaseModel):
    current_allocation: dict
    recommended_allocation: dict
    expected_improvement: dict
    risk_metrics: dict
