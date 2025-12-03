import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Portfolio } from '../../models/portfolio';
import { PortfolioService } from '../../services/portfolio.service';
import { AuthService } from '../../services/auth.service';
import { StockQuote, TrendingStockResult } from '../../models/stock';

@Component({
  standalone: true,
  selector: 'app-transaction-select-portfolio-modal',
  imports: [CommonModule],
  templateUrl: './transaction-select-portfolio-modal.component.html',
  styleUrls: ['./transaction-select-portfolio-modal.component.scss'],
})
export class TransactionSelectPortfolioModal implements OnInit {
  @Input() stock!: StockQuote | TrendingStockResult;
  @Output() portfolioSelected = new EventEmitter<Portfolio>();
  @Output() close = new EventEmitter<void>();

  portfolios: Portfolio[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    private portfolioService: PortfolioService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadPortfolios();
  }

  private loadPortfolios(): void {
    const currentUser = this.authService.currentUser;
    if (!currentUser) {
      this.error = 'User not authenticated';
      return;
    }

    this.loading = true;
    this.portfolioService.getPortfoliosByUser(currentUser.id).subscribe({
      next: (portfolios) => {
        this.portfolios = portfolios;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load portfolios:', err);
        this.error = 'Failed to load portfolios';
        this.loading = false;
      }
    });
  }

  selectPortfolio(portfolio: Portfolio): void {
    this.portfolioSelected.emit(portfolio);
  }

  onOverlayClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close.emit();
    }
  }

  getStockName(): string {
    if ('shortName' in this.stock) {
      return this.stock.shortName || this.stock.ticker || this.stock.symbol;
    } else if ('shortname' in this.stock) {
      return this.stock.shortname || this.stock.ticker || this.stock.symbol;
    }
    return this.stock.ticker || this.stock.symbol;
  }
}
