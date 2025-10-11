"""
Example script demonstrating Portfolio Management with AI
Run the server first: uvicorn app.main:app --reload
Then run this script: python demo.py
"""
import requests
import time
from typing import Dict, List

BASE_URL = "http://localhost:8000"

def print_section(title: str):
    """Print a formatted section header"""
    print("\n" + "=" * 60)
    print(f"  {title}")
    print("=" * 60)

def create_user(username: str, email: str, password: str) -> Dict:
    """Create a new user"""
    response = requests.post(
        f"{BASE_URL}/api/users/",
        json={
            "username": username,
            "email": email,
            "password": password
        }
    )
    if response.status_code == 201:
        return response.json()
    else:
        print(f"Error creating user: {response.text}")
        return None

def create_portfolio(user_id: int, name: str, description: str) -> Dict:
    """Create a new portfolio"""
    response = requests.post(
        f"{BASE_URL}/api/portfolios/?user_id={user_id}",
        json={
            "name": name,
            "description": description
        }
    )
    if response.status_code == 201:
        return response.json()
    else:
        print(f"Error creating portfolio: {response.text}")
        return None

def add_assets(portfolio_id: int, assets: List[tuple]):
    """Add multiple assets to portfolio"""
    print(f"\nAdding {len(assets)} assets to portfolio...")
    for symbol, quantity, price in assets:
        response = requests.post(
            f"{BASE_URL}/api/portfolios/{portfolio_id}/assets",
            params={
                "asset_symbol": symbol,
                "quantity": quantity,
                "purchase_price": price
            }
        )
        if response.status_code == 200:
            print(f"  ✓ Added {quantity} shares of {symbol} @ ${price:.2f}")
        else:
            print(f"  ✗ Failed to add {symbol}: {response.text}")
        time.sleep(0.5)  # Avoid rate limiting

def get_portfolio_holdings(portfolio_id: int) -> Dict:
    """Get portfolio holdings"""
    response = requests.get(f"{BASE_URL}/api/portfolios/{portfolio_id}/holdings")
    if response.status_code == 200:
        return response.json()
    return None

def analyze_portfolio(portfolio_id: int) -> Dict:
    """Get AI analysis of portfolio"""
    response = requests.get(f"{BASE_URL}/api/analysis/{portfolio_id}")
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Error analyzing portfolio: {response.text}")
        return None

def optimize_portfolio(portfolio_id: int) -> Dict:
    """Optimize portfolio allocation"""
    response = requests.post(
        f"{BASE_URL}/api/analysis/optimize",
        json={"portfolio_id": portfolio_id}
    )
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Error optimizing portfolio: {response.text}")
        return None

def print_analysis(analysis: Dict):
    """Print portfolio analysis results"""
    print(f"\n📊 Portfolio Analysis Results:")
    print(f"  Total Value: ${analysis['total_value']:,.2f}")
    print(f"  Expected Annual Return: {analysis['expected_return']*100:.2f}%")
    print(f"  Volatility (Risk): {analysis['volatility']*100:.2f}%")
    print(f"  Sharpe Ratio: {analysis['sharpe_ratio']:.2f}")
    print(f"  Diversification Score: {analysis['diversification_score']:.2f}")
    print(f"  Risk Level: {analysis['risk_level']}")
    
    print(f"\n💡 AI Recommendations:")
    for i, rec in enumerate(analysis['recommendations'], 1):
        print(f"  {i}. {rec}")

def print_optimization(optimization: Dict):
    """Print portfolio optimization results"""
    print(f"\n🎯 Portfolio Optimization Results:")
    
    print(f"\n  Current Allocation:")
    for symbol, weight in optimization['current_allocation'].items():
        print(f"    {symbol}: {weight*100:.2f}%")
    
    print(f"\n  Recommended Allocation:")
    for symbol, weight in optimization['recommended_allocation'].items():
        print(f"    {symbol}: {weight*100:.2f}%")
    
    print(f"\n  Expected Improvements:")
    improvements = optimization['expected_improvement']
    print(f"    Return: {improvements['return_improvement']*100:+.2f}%")
    print(f"    Volatility: {improvements['volatility_change']*100:+.2f}%")
    print(f"    Sharpe Ratio: {improvements['sharpe_improvement']:+.2f}")
    
    print(f"\n  Risk Metrics:")
    risk = optimization['risk_metrics']
    print(f"    Current Volatility: {risk['current_volatility']*100:.2f}%")
    print(f"    Optimal Volatility: {risk['optimal_volatility']*100:.2f}%")
    print(f"    Current Sharpe: {risk['current_sharpe']:.2f}")
    print(f"    Optimal Sharpe: {risk['optimal_sharpe']:.2f}")

def main():
    """Run the demo"""
    print_section("Portfolio Management with AI - Demo")
    
    # Check if server is running
    try:
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code != 200:
            print("❌ Server is not responding. Please start the server first:")
            print("   uvicorn app.main:app --reload")
            return
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to server. Please start the server first:")
        print("   uvicorn app.main:app --reload")
        return
    
    print("✅ Server is running!\n")
    
    # Step 1: Create User
    print_section("Step 1: Creating User")
    user = create_user(
        username="demo_investor",
        email="demo@investor.com",
        password="demo123"
    )
    if not user:
        print("❌ Demo stopped: Could not create user")
        return
    print(f"✅ Created user: {user['username']} (ID: {user['id']})")
    
    # Step 2: Create Portfolio
    print_section("Step 2: Creating Portfolio")
    portfolio = create_portfolio(
        user_id=user['id'],
        name="Tech Growth Portfolio",
        description="Diversified technology sector investments"
    )
    if not portfolio:
        print("❌ Demo stopped: Could not create portfolio")
        return
    print(f"✅ Created portfolio: {portfolio['name']} (ID: {portfolio['id']})")
    
    # Step 3: Add Assets
    print_section("Step 3: Adding Assets to Portfolio")
    assets = [
        ("AAPL", 15, 150.00),   # Apple
        ("GOOGL", 8, 2800.00),  # Google
        ("MSFT", 12, 350.00),   # Microsoft
        ("AMZN", 5, 3300.00),   # Amazon
        ("NVDA", 10, 500.00),   # NVIDIA
    ]
    add_assets(portfolio['id'], assets)
    
    # Step 4: View Holdings
    print_section("Step 4: Current Portfolio Holdings")
    holdings = get_portfolio_holdings(portfolio['id'])
    if holdings:
        print("\n📦 Holdings:")
        for symbol, data in holdings['holdings'].items():
            avg_cost = data['total_cost'] / data['quantity']
            print(f"  {symbol}: {data['quantity']} shares @ avg ${avg_cost:.2f}")
    
    # Step 5: AI Analysis
    print_section("Step 5: AI-Powered Portfolio Analysis")
    print("🤖 Running AI analysis...")
    time.sleep(1)  # Give time for data to be fetched
    
    analysis = analyze_portfolio(portfolio['id'])
    if analysis:
        print_analysis(analysis)
    else:
        print("⚠️  Analysis failed - this is normal if market data is unavailable")
        print("   The analysis requires live market data from Yahoo Finance")
    
    # Step 6: AI Optimization
    print_section("Step 6: AI-Powered Portfolio Optimization")
    print("🤖 Optimizing portfolio allocation...")
    time.sleep(1)
    
    optimization = optimize_portfolio(portfolio['id'])
    if optimization:
        print_optimization(optimization)
    else:
        print("⚠️  Optimization failed - this is normal if market data is unavailable")
        print("   The optimization requires historical market data")
    
    # Summary
    print_section("Demo Complete!")
    print("\n✅ Successfully demonstrated:")
    print("  • User management")
    print("  • Portfolio creation")
    print("  • Asset management")
    print("  • AI-powered analysis")
    print("  • AI-powered optimization")
    
    print("\n📚 Next steps:")
    print("  • Visit http://localhost:8000/docs for interactive API documentation")
    print("  • Explore different portfolios and asset combinations")
    print("  • Try optimization with different target returns")
    print("  • Check out the test suite: pytest")
    
    print("\n" + "=" * 60)

if __name__ == "__main__":
    main()
