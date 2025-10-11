"""Asset management endpoints"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.models.database import get_db
from app.models.models import Asset
from app.schemas import schemas
from app.services.market_data import MarketDataService
from datetime import datetime

router = APIRouter()

@router.post("/", response_model=schemas.Asset, status_code=status.HTTP_201_CREATED)
def create_asset(asset: schemas.AssetCreate, db: Session = Depends(get_db)):
    """Create a new asset"""
    # Check if asset exists
    db_asset = db.query(Asset).filter(Asset.symbol == asset.symbol).first()
    if db_asset:
        raise HTTPException(status_code=400, detail="Asset already exists")
    
    # Fetch current price
    current_price = MarketDataService.get_asset_price(asset.symbol) or 0.0
    
    db_asset = Asset(
        symbol=asset.symbol,
        name=asset.name,
        asset_type=asset.asset_type,
        sector=asset.sector,
        current_price=current_price,
        last_updated=datetime.utcnow()
    )
    db.add(db_asset)
    db.commit()
    db.refresh(db_asset)
    return db_asset

@router.get("/{symbol}", response_model=schemas.Asset)
def get_asset(symbol: str, db: Session = Depends(get_db)):
    """Get asset by symbol"""
    asset = db.query(Asset).filter(Asset.symbol == symbol).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    return asset

@router.get("/", response_model=List[schemas.Asset])
def list_assets(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """List all assets"""
    return db.query(Asset).offset(skip).limit(limit).all()

@router.get("/{symbol}/price")
def get_asset_price(symbol: str):
    """Get current price for an asset"""
    price = MarketDataService.get_asset_price(symbol)
    if price is None:
        raise HTTPException(status_code=404, detail="Price not available")
    return {"symbol": symbol, "price": price}

@router.get("/{symbol}/info")
def get_asset_info(symbol: str):
    """Get detailed information about an asset"""
    info = MarketDataService.get_asset_info(symbol)
    return info
