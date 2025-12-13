import { Component } from '@angular/core';
import { StockSearchbar } from '../../../components/stock/stock-searchbar/stock-searchbar.component';
import { Stock, StockQuote, TrendingStockResult } from '../../../models/stock';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { TransactionSelectPortfolioModal } from '../../../components/transaction-select-portfolio-modal/transaction-select-portfolio-modal.component';
import { CreateTransactionModalComponent } from '../../../components/create-transaction-modal.component/create-transaction-modal.component';
import { Portfolio } from '../../../models/portfolio';
import { WatchlistService } from '../../../services/watchlist.service';
import { StockService } from '../../../services/stock.service';
import { Observable, of, switchMap, tap, finalize } from 'rxjs';
import { SingleStockChatbot } from '../../../chatbot-windows/single-stock-chatbot/single-stock-chatbot';

@Component({
  selector: 'app-stock-overview',
  imports: [CommonModule, StockSearchbar, TransactionSelectPortfolioModal, CreateTransactionModalComponent, SingleStockChatbot],
  templateUrl: './stock-overview.html',
  styleUrl: './stock-overview.scss',
})
export class StockOverview {
  selectedStock: StockQuote | TrendingStockResult | null = null;
  showPortfolioModal = false;
  showTransactionModal = false;
  selectedPortfolio: Portfolio | null = null;
  watchlistAdding = false;
  watchlistError: string | null = null;
  watchlistSuccess: string | null = null;
  private existingStocks: Stock[] | null = null;
  private stockCache = new Map<string, Stock>();

  constructor(
    private authService: AuthService,
    private watchlistService: WatchlistService,
    private stockService: StockService
  ) {}

  get isAuthenticated(): boolean {
    return this.authService.isAuthenticated;
  }

  onStockSelected(stock: StockQuote | TrendingStockResult): void {
    this.selectedStock = stock;
    console.log('Selected stock:', stock);
    this.watchlistError = null;
    this.watchlistSuccess = null;
    this.watchlistAdding = false;
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
  }

  addToWatchlist(): void {
    if (!this.selectedStock) {
      return;
    }

    if (!this.isAuthenticated || !this.authService.currentUser) {
      this.authService.notifyAuthRequired();
      return;
    }

    const identifier = this.extractStockIdentifier(this.selectedStock);
    if (!identifier) {
      this.watchlistError = 'Für diese Aktie liegt keine eindeutige Kennung vor.';
      return;
    }

    this.watchlistAdding = true;
    this.watchlistError = null;
    this.watchlistSuccess = null;

    this.ensureStockRecord(this.selectedStock, identifier)
      .pipe(
        switchMap((stock) =>
          this.watchlistService.addEntry({
            user_id: this.authService.currentUser!.id,
            aktie_id: stock.id,
          })
        ),
        finalize(() => (this.watchlistAdding = false))
      )
      .subscribe({
        next: () => {
          this.watchlistSuccess = 'Zur Watchlist hinzugefügt.';
        },
        error: (error) => {
          console.error('Watchlist add failed', error);
          if (error?.status === 400 || error?.status === 409) {
            this.watchlistError = 'Diese Aktie befindet sich bereits in deiner Watchlist.';
          } else {
            this.watchlistError = 'Watchlist konnte nicht aktualisiert werden.';
          }
        },
      });
  }

  isStockQuote(stock: StockQuote | TrendingStockResult): stock is StockQuote {
    return 'shortName' in stock || 'longName' in stock;
  }

  isTrendingStock(stock: StockQuote | TrendingStockResult): stock is TrendingStockResult {
    return 'shortname' in stock || 'longname' in stock;
  }

  private extractStockIdentifier(stock: StockQuote | TrendingStockResult): string | null {
    return (
      stock.isin ||
      (stock as any).ISIN ||
      stock.ticker ||
      stock.symbol ||
      null
    );
  }

  private ensureStockRecord(stockData: StockQuote | TrendingStockResult, identifier: string): Observable<Stock> {
    if (this.stockCache.has(identifier)) {
      return of(this.stockCache.get(identifier)!);
    }

    return this.loadExistingStocks().pipe(
      switchMap((stocks) => {
        const existing = stocks.find((stock) => stock.isin === identifier);
        if (existing) {
          this.stockCache.set(identifier, existing);
          return of(existing);
        }

        const payload = this.buildStockPayload(stockData, identifier);
        return this.stockService.createStock(payload).pipe(
          tap((created) => {
            this.stockCache.set(identifier, created);
            this.existingStocks?.push(created);
          })
        );
      })
    );
  }

  private loadExistingStocks(): Observable<Stock[]> {
    if (this.existingStocks) {
      return of(this.existingStocks);
    }

    return this.stockService.getStocks().pipe(
      tap((stocks) => {
        this.existingStocks = stocks;
        stocks.forEach((stock) => this.stockCache.set(stock.isin, stock));
      })
    );
  }

  private buildStockPayload(stock: StockQuote | TrendingStockResult, identifier: string): Partial<Stock> {
    return {
      name: this.resolveStockName(stock, identifier),
      isin: identifier,
      firma: stock.exchange || 'Unbekannte Börse',
      beschreibung: (stock as any).longName || (stock as any).longname || '',
      kategorie: (stock as any).sector,
      currency: stock.currency,
    };
  }

  private resolveStockName(stock: StockQuote | TrendingStockResult, fallback: string): string {
    return (
      (stock as StockQuote).shortName ||
      (stock as TrendingStockResult).shortname ||
      (stock as StockQuote).longName ||
      (stock as TrendingStockResult).longname ||
      stock.symbol ||
      stock.ticker ||
      fallback
    );
  }
}
