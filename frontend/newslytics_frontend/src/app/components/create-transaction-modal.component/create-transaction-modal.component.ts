import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { Portfolio } from '../../models/portfolio';
import { StockQuote, TrendingStockResult } from '../../models/stock';
import { TransactionService } from '../../services/transaction.service';
import { CreateTransactionRequest } from '../../models/transactions';
import { StockService } from '../../services/stock.service';

@Component({
  standalone: true,
  selector: 'app-create-transaction-modal',
  imports: [CommonModule, FormsModule],
  templateUrl: './create-transaction-modal.component.html',
  styleUrl: './create-transaction-modal.component.scss',
})
export class CreateTransactionModalComponent implements OnInit {
  @Input() portfolio!: Portfolio;
  @Input() stock!: StockQuote | TrendingStockResult;
  @Output() close = new EventEmitter<void>();
  @Output() transactionCreated = new EventEmitter<void>();

  menge: number = 1;
  kaufpreis: number = 0;
  kaufdatum: string = '';
  loading = false;
  error: string | null = null;
  aktieId: number | null = null;
  stockName: string = '';

  constructor(
    private transactionService: TransactionService,
    private stockService: StockService
  ) {}

  ngOnInit(): void {
    // Set today's date as default
    const today = new Date();
    this.kaufdatum = today.toISOString().split('T')[0];

    // Get stock name
    this.stockName = this.getStockName();

    // Set default price if available
    if ('regularMarketPrice' in this.stock && this.stock.regularMarketPrice) {
      this.kaufpreis = this.stock.regularMarketPrice;
    }

    // Optionally check if stock exists (but don't block)
    this.checkIfStockExists();
  }

  private checkIfStockExists(): void {
    const isin = this.stock.isin;
    const symbol = this.stock.ticker || this.stock.symbol;
    
    if (!isin && !symbol) {
      return; // Will create stock when submitting
    }

    // Search for existing stock by ISIN or symbol
    this.stockService.getStocks().subscribe({
      next: (stocks) => {
        let existingStock;
        
        if (isin) {
          existingStock = stocks.find(s => s.isin === isin);
        }
        
        // Fallback to name if ISIN not found
        if (!existingStock && symbol) {
          existingStock = stocks.find(s => 
            s.name === symbol || s.firma === symbol
          );
        }
        
        if (existingStock) {
          this.aktieId = existingStock.id;
        }
      },
      error: (err) => {
        console.error('Failed to check existing stocks:', err);
        // Don't set error, just continue
      }
    });
  }

  private ensureStockExists(): Observable<number> {
    return new Observable(observer => {
      if (this.aktieId) {
        observer.next(this.aktieId);
        observer.complete();
        return;
      }

      // Create stock if it doesn't exist
      const stockData = {
        name: this.getStockName(),
        isin: this.stock.isin || 'N/A',
        firma: this.getStockName(),
        currency: this.stock.currency,
        beschreibung: '',
        kategorie: this.stock.sector,
        land: this.stock.exchange
      };

      this.stockService.createStock(stockData).subscribe({
        next: (newStock) => {
          this.aktieId = newStock.id;
          observer.next(newStock.id);
          observer.complete();
        },
        error: (err) => {
          observer.error(err);
        }
      });
    });
  }

  getStockName(): string {
    if ('shortName' in this.stock) {
      return this.stock.shortName || this.stock.ticker || this.stock.symbol;
    } else if ('shortname' in this.stock) {
      return this.stock.shortname || this.stock.ticker || this.stock.symbol;
    }
    return this.stock.ticker || this.stock.symbol;
  }

  onSubmit(): void {
    if (this.menge <= 0) {
      this.error = 'Quantity must be greater than 0';
      return;
    }

    if (this.kaufpreis <= 0) {
      this.error = 'Purchase price must be greater than 0';
      return;
    }

    if (!this.kaufdatum) {
      this.error = 'Purchase date is required';
      return;
    }

    this.loading = true;
    this.error = null;

    // Ensure stock exists (create if necessary) before creating transaction
    this.ensureStockExists().subscribe({
      next: (aktieId) => {
        const transaction: CreateTransactionRequest = {
          menge: this.menge,
          kaufpreis: this.kaufpreis,
          kaufdatum: this.kaufdatum,
          aktie_id: aktieId,
          portfolio_id: this.portfolio.id
        };

        this.transactionService.createTransaction(transaction).subscribe({
          next: () => {
            this.loading = false;
            this.transactionCreated.emit();
          },
          error: (err) => {
            console.error('Failed to create transaction:', err);
            this.error = 'Failed to create transaction';
            this.loading = false;
          }
        });
      },
      error: (err) => {
        console.error('Failed to ensure stock exists:', err);
        this.error = 'Failed to create stock entry';
        this.loading = false;
      }
    });
  }

  onOverlayClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close.emit();
    }
  }
}
