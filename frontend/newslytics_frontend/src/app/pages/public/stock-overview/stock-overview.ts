import { Component } from '@angular/core';
import { StockSearchbar } from '../../../components/stock/stock-searchbar/stock-searchbar.component';
import { StockQuote, TrendingStockResult } from '../../../models/stock';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { TransactionSelectPortfolioModal } from '../../../components/transaction-select-portfolio-modal/transaction-select-portfolio-modal.component';
import { CreateTransactionModalComponent } from '../../../components/create-transaction-modal.component/create-transaction-modal.component';
import { Portfolio } from '../../../models/portfolio';

@Component({
  selector: 'app-stock-overview',
  imports: [CommonModule, StockSearchbar, TransactionSelectPortfolioModal, CreateTransactionModalComponent],
  templateUrl: './stock-overview.html',
  styleUrl: './stock-overview.scss',
})
export class StockOverview {
  selectedStock: StockQuote | TrendingStockResult | null = null;
  showPortfolioModal = false;
  showTransactionModal = false;
  selectedPortfolio: Portfolio | null = null;

  constructor(private authService: AuthService) {}

  get isAuthenticated(): boolean {
    return this.authService.isAuthenticated;
  }

  onStockSelected(stock: StockQuote | TrendingStockResult): void {
    this.selectedStock = stock;
    console.log('Selected stock:', stock);
  }

  openPortfolioSelection(): void {
    this.showPortfolioModal = true;
  }

  onPortfolioSelected(portfolio: Portfolio): void {
    this.selectedPortfolio = portfolio;
    this.showPortfolioModal = false;
    this.showTransactionModal = true;
  }

  closeTransactionModal(): void {
    this.showTransactionModal = false;
    this.selectedPortfolio = null;
  }

  onTransactionCreated(): void {
    this.closeTransactionModal();
    // Optionally show success message or refresh data
  }

  isStockQuote(stock: StockQuote | TrendingStockResult): stock is StockQuote {
    return 'shortName' in stock || 'longName' in stock;
  }

  isTrendingStock(stock: StockQuote | TrendingStockResult): stock is TrendingStockResult {
    return 'shortname' in stock || 'longname' in stock;
  }
}
