# Contributing to Portfolio Management with AI

We welcome contributions to the Portfolio Management with AI project! This document provides guidelines for contributing.

## Getting Started

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/PR_ServiceEngineering25_Gruppe1.git
   ```
3. Create a virtual environment and install dependencies:
   ```bash
   python -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

## Development Workflow

1. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes following our coding standards

3. Test your changes:
   ```bash
   pytest
   ```

4. Commit your changes:
   ```bash
   git add .
   git commit -m "Add: brief description of your changes"
   ```

5. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

6. Create a Pull Request

## Coding Standards

### Python Style
- Follow PEP 8 guidelines
- Use type hints for function parameters and return values
- Write docstrings for all public functions and classes
- Keep functions focused and single-purpose
- Maximum line length: 100 characters

### Example:
```python
def calculate_portfolio_value(holdings: Dict[str, float], 
                              prices: Dict[str, float]) -> float:
    """
    Calculate total portfolio value.
    
    Args:
        holdings: Dictionary of asset symbols to quantities
        prices: Dictionary of asset symbols to current prices
        
    Returns:
        Total portfolio value in USD
    """
    return sum(holdings[symbol] * prices.get(symbol, 0) 
               for symbol in holdings)
```

### Project Structure
- Place models in `app/models/`
- Place API endpoints in `app/api/`
- Place business logic in `app/services/`
- Place AI/ML code in `app/ai/`
- Place tests in `tests/`

### Testing
- Write unit tests for all new functions
- Write integration tests for API endpoints
- Aim for >80% code coverage
- Test edge cases and error conditions

### Documentation
- Update README.md if adding new features
- Update API_REFERENCE.md for new endpoints
- Add docstrings to all public functions
- Include usage examples for complex features

## Commit Message Guidelines

Use conventional commit format:

- `Add:` - New features
- `Fix:` - Bug fixes
- `Update:` - Updates to existing features
- `Refactor:` - Code refactoring
- `Test:` - Adding or updating tests
- `Docs:` - Documentation changes

Example:
```
Add: portfolio diversification score calculation

Implement diversification score using variance decomposition
method to measure portfolio concentration risk.
```

## Pull Request Process

1. Update documentation if needed
2. Add tests for new functionality
3. Ensure all tests pass
4. Update the README.md with details of changes if applicable
5. Request review from maintainers

## Feature Requests

Feature requests are welcome! Please:
1. Check existing issues first
2. Create a new issue with:
   - Clear description of the feature
   - Use cases and benefits
   - Potential implementation approach
   - Any related examples or references

## Bug Reports

When reporting bugs, please include:
1. Description of the issue
2. Steps to reproduce
3. Expected behavior
4. Actual behavior
5. Environment details (OS, Python version, etc.)
6. Relevant logs or error messages

## Code Review

All submissions require code review. We use GitHub pull requests for this purpose. Reviews focus on:
- Code quality and style
- Test coverage
- Documentation
- Performance implications
- Security considerations

## Areas for Contribution

We're especially interested in contributions for:

### Features
- Advanced AI models for price prediction
- Real-time portfolio tracking with WebSocket
- Tax optimization algorithms
- Backtesting framework
- Multi-currency support
- Risk management tools (VaR, CVaR)

### Improvements
- Performance optimization
- Better error handling
- Enhanced documentation
- More comprehensive tests
- UI/Frontend development

### Bug Fixes
- Check our issues labeled `bug`

## Questions?

Feel free to:
- Open an issue for questions
- Contact the maintainers
- Check existing documentation

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Code of Conduct

### Our Pledge
We pledge to make participation in our project a harassment-free experience for everyone.

### Our Standards
- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Accepting constructive criticism gracefully
- Focusing on what is best for the community
- Showing empathy towards others

### Enforcement
Unacceptable behavior may be reported to project maintainers. All complaints will be reviewed and investigated.

Thank you for contributing to Portfolio Management with AI! 🚀
