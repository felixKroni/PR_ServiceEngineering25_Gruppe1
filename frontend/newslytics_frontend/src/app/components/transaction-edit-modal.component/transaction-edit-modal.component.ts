import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Transaction, UpdateTransactionRequest } from '../../models/transactions';
import { TransactionService } from '../../services/transaction.service';
import { Stock } from '../../models/stock';
import { StockService } from '../../services/stock.service';

@Component({
  standalone: true,
  selector: 'app-transaction-edit-modal',
  imports: [CommonModule, FormsModule],
  templateUrl: './transaction-edit-modal.component.html',
  styleUrl: './transaction-edit-modal.component.scss',
})
export class TransactionEditModalComponent implements OnInit {
  @Input() transaction!: Transaction;
  @Output() close = new EventEmitter<void>();
  @Output() transactionUpdated = new EventEmitter<void>();
  @Output() transactionDeleted = new EventEmitter<void>();

  menge: number = 0;
  kaufpreis: number = 0;
  kaufdatum: string = '';
  loading = false;
  error: string | null = null;
  stock: Stock | null = null;
  stockLoading = true;
  showDeleteConfirm = false;
  deleting = false;

  constructor(
    private transactionService: TransactionService,
    private stockService: StockService
  ) {}

  ngOnInit(): void {
    this.menge = this.transaction.menge;
    this.kaufpreis = this.transaction.kaufpreis;
    this.kaufdatum = this.transaction.kaufdatum.split('T')[0];

    this.loadStock();
  }

  private loadStock(): void {
    this.stockService.getStock(this.transaction.aktie_id).subscribe({
      next: (stock) => {
        this.stock = stock;
        this.stockLoading = false;
      },
      error: (err) => {
        console.error('Failed to load stock:', err);
        this.stockLoading = false;
      }
    });
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

    const updateData: UpdateTransactionRequest = {
      menge: this.menge,
      kaufpreis: this.kaufpreis,
      kaufdatum: this.kaufdatum
    };

    this.transactionService.updateTransaction(this.transaction.id, updateData).subscribe({
      next: () => {
        this.loading = false;
        this.transactionUpdated.emit();
      },
      error: (err) => {
        console.error('Failed to update transaction:', err);
        this.error = 'Failed to update transaction';
        this.loading = false;
      }
    });
  }

  onDelete(): void {
    this.showDeleteConfirm = true;
  }

  confirmDelete(): void {
    this.deleting = true;
    this.error = null;

    this.transactionService.deleteTransaction(this.transaction.id).subscribe({
      next: () => {
        this.deleting = false;
        this.transactionDeleted.emit();
      },
      error: (err) => {
        console.error('Failed to delete transaction:', err);
        this.error = 'Failed to delete transaction';
        this.deleting = false;
        this.showDeleteConfirm = false;
      }
    });
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
  }

  getStockName(): string {
    return this.stock?.name || this.stock?.firma || 'Loading...';
  }

  onOverlayClick(event: MouseEvent): void {
    if (event.target === event.currentTarget && !this.showDeleteConfirm) {
      this.close.emit();
    }
  }
}
