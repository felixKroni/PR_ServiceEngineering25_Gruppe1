"""Database models for Portfolio Management"""
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Table
from sqlalchemy.orm import relationship
from datetime import datetime
from app.models.database import Base

# Association table for portfolio-asset relationship
portfolio_assets = Table(
    'portfolio_assets',
    Base.metadata,
    Column('portfolio_id', Integer, ForeignKey('portfolios.id')),
    Column('asset_id', Integer, ForeignKey('assets.id')),
    Column('quantity', Float, default=0.0),
    Column('purchase_price', Float, default=0.0),
    Column('purchase_date', DateTime, default=datetime.utcnow)
)

class User(Base):
    """User model"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    portfolios = relationship("Portfolio", back_populates="owner")

class Portfolio(Base):
    """Portfolio model"""
    __tablename__ = "portfolios"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String, nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    owner = relationship("User", back_populates="portfolios")
    assets = relationship("Asset", secondary=portfolio_assets, back_populates="portfolios")
    transactions = relationship("Transaction", back_populates="portfolio")

class Asset(Base):
    """Asset model"""
    __tablename__ = "assets"
    
    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String, unique=True, index=True)
    name = Column(String)
    asset_type = Column(String)  # stock, bond, crypto, etf, etc.
    sector = Column(String, nullable=True)
    current_price = Column(Float, default=0.0)
    last_updated = Column(DateTime, default=datetime.utcnow)
    
    portfolios = relationship("Portfolio", secondary=portfolio_assets, back_populates="assets")

class Transaction(Base):
    """Transaction model"""
    __tablename__ = "transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    portfolio_id = Column(Integer, ForeignKey("portfolios.id"))
    asset_symbol = Column(String)
    transaction_type = Column(String)  # buy, sell
    quantity = Column(Float)
    price = Column(Float)
    total_value = Column(Float)
    transaction_date = Column(DateTime, default=datetime.utcnow)
    
    portfolio = relationship("Portfolio", back_populates="transactions")
