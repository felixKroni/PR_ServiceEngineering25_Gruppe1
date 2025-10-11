"""Service for fetching and managing market data"""
import yfinance as yf
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Optional

class MarketDataService:
    """Service for fetching market data"""
    
    @staticmethod
    def get_asset_price(symbol: str) -> Optional[float]:
        """Get current price for an asset"""
        try:
            ticker = yf.Ticker(symbol)
            data = ticker.history(period="1d")
            if not data.empty:
                return float(data['Close'].iloc[-1])
        except Exception as e:
            print(f"Error fetching price for {symbol}: {e}")
        return None
    
    @staticmethod
    def get_historical_prices(symbols: List[str], 
                            period: str = "1y") -> pd.DataFrame:
        """Get historical prices for multiple symbols"""
        try:
            data = yf.download(symbols, period=period, progress=False)
            if len(symbols) == 1:
                return pd.DataFrame({symbols[0]: data['Close']})
            return data['Close']
        except Exception as e:
            print(f"Error fetching historical data: {e}")
            return pd.DataFrame()
    
    @staticmethod
    def get_asset_info(symbol: str) -> Dict:
        """Get detailed information about an asset"""
        try:
            ticker = yf.Ticker(symbol)
            info = ticker.info
            return {
                'symbol': symbol,
                'name': info.get('longName', symbol),
                'sector': info.get('sector', 'Unknown'),
                'industry': info.get('industry', 'Unknown'),
                'current_price': info.get('currentPrice', 0.0),
                'market_cap': info.get('marketCap', 0),
                'pe_ratio': info.get('trailingPE', 0),
            }
        except Exception as e:
            print(f"Error fetching info for {symbol}: {e}")
            return {'symbol': symbol, 'name': symbol}
    
    @staticmethod
    def update_asset_prices(assets: List[str]) -> Dict[str, float]:
        """Update prices for multiple assets"""
        prices = {}
        for symbol in assets:
            price = MarketDataService.get_asset_price(symbol)
            if price:
                prices[symbol] = price
        return prices
