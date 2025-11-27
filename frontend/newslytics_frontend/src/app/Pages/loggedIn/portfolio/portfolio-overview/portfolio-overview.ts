import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Portfolio } from '../../../../Models/portfolio';
import { Transaction } from '../../../../Models/stock';
import { PortfolioService } from '../../../../Services/portfolio.service';
import { StockService } from '../../../../Services/stock.service';
import { StockPositionComponent } from '../../../../Components/Stock/stock-position.component';

@Component({
  standalone: true,
  selector: 'app-portfolio-overview',
  imports: [CommonModule, StockPositionComponent],
  templateUrl: './portfolio-overview.html',
  styleUrl: './portfolio-overview.scss',
})
export class PortfolioOverview implements OnInit {
  portfolio: Portfolio | null = null;
  isLoading = false;
  error: string | null = null;
  positions: Transaction[] = [];
  positionsLoading = false;
  positionsError: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private portfolioService: PortfolioService,
    private stockService: StockService
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
        this.loadPositions(id);
      },
      error: () => {
        this.error = 'Portfolio konnte nicht geladen werden.';
        this.isLoading = false;
      }
    });
  }

  private loadPositions(portfolioId: number): void {
    this.positionsLoading = true;
    this.stockService.getTransactionsByPortfolio(portfolioId).subscribe({
      next: (transactions) => {
        this.positions = transactions;
        this.positionsLoading = false;
        this.positionsError = null;
      },
      error: () => {
        this.positionsLoading = false;
        this.positionsError = 'Positionen konnten nicht geladen werden.';
      }
    });
  }

  addDummyPosition(): void {
    if (!this.portfolio || this.positionsLoading) {
      return;
    }

    const maxId = this.positions.length
      ? Math.max(...this.positions.map((position) => position.id))
      : 0;

    const dummy: Transaction = {
      id: maxId + 1,
      menge: 5,
      kaufpreis: 123.45,
      kaufdatum: new Date().toISOString(),
      aktie_id: 999000 + (maxId + 1),
      portfolio_id: this.portfolio.id,
    };

    this.positions = [...this.positions, dummy];
    this.positionsError = null;
  }
}
