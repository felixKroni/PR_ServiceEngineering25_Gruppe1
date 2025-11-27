import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Portfolio } from '../../../../Models/portfolio';
import { PortfolioService } from '../../../../Services/portfolio.service';

@Component({
  standalone: true,
  selector: 'app-portfolio-overview',
  imports: [CommonModule],
  templateUrl: './portfolio-overview.html',
  styleUrl: './portfolio-overview.scss',
})
export class PortfolioOverview implements OnInit {
  portfolio: Portfolio | null = null;
  isLoading = false;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private portfolioService: PortfolioService
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
      },
      error: () => {
        this.error = 'Portfolio konnte nicht geladen werden.';
        this.isLoading = false;
      }
    });
  }
}
