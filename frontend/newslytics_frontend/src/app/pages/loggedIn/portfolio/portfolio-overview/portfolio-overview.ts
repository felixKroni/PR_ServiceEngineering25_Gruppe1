import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Portfolio } from '../../../../models/portfolio';
import { Transaction } from '../../../../models/transactions';
import { PortfolioService } from '../../../../services/portfolio.service';
import { TransactionService } from '../../../../services/transaction.service';
import { StockPositionComponent } from '../../../../components/stock/stock-position.component';
import { TransactionEditModalComponent } from '../../../../components/transaction-edit-modal.component/transaction-edit-modal.component';

@Component({
  standalone: true,
  selector: 'app-portfolio-overview',
  imports: [CommonModule, StockPositionComponent, TransactionEditModalComponent],
  templateUrl: './portfolio-overview.html',
  styleUrl: './portfolio-overview.scss',
})
export class PortfolioOverview implements OnInit {
  portfolio: Portfolio | null = null;
  isLoading = false;
  error: string | null = null;
  transactions: Transaction[] = [];
  transactionsLoading = false;
  transactionsError: string | null = null;
  showEditModal = false;
  selectedTransaction: Transaction | null = null;

  constructor(
    private route: ActivatedRoute,
    private portfolioService: PortfolioService,
    private transactionService: TransactionService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : null;

    if (!id) {
      this.error = 'Ungültige Portfolio-ID.';
      return;
    }

    this.fetchPortfolio(id);
  }

  private fetchPortfolio(id: number): void {
    this.isLoading = true;
    this.portfolioService.getPortfolio(id).subscribe({
      next: (portfolio) => {
        this.portfolio = portfolio;
        this.isLoading = false;
        this.loadTransactions(id);
      },
      error: () => {
        this.error = 'Portfolio konnte nicht geladen werden.';
        this.isLoading = false;
      }
    });
  }

  private loadTransactions(portfolioId: number): void {
    this.transactionsLoading = true;
    this.transactionService.getTransactionsByPortfolio(portfolioId).subscribe({
      next: (transactions) => {
        this.transactions = transactions;
        this.transactionsLoading = false;
        this.transactionsError = null;
      },
      error: (err) => {
        console.error('Failed to load transactions:', err);
        this.transactionsLoading = false;
        this.transactionsError = 'Positionen konnten nicht geladen werden.';
      }
    });
  }

  onEditTransaction(transaction: Transaction): void {
    this.selectedTransaction = transaction;
    this.showEditModal = true;
  }

  onCloseEditModal(): void {
    this.showEditModal = false;
    this.selectedTransaction = null;
  }

  onTransactionUpdated(): void {
    this.showEditModal = false;
    this.selectedTransaction = null;

    if (this.portfolio) {
      this.loadTransactions(this.portfolio.id);
    }
  }

  onTransactionDeleted(): void {
    this.showEditModal = false;
    this.selectedTransaction = null;

    if (this.portfolio) {
      this.loadTransactions(this.portfolio.id);
    }
  }
}
