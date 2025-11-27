import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { PortfolioPlaceholderComponent } from '../../../Components/Portfolio/portfolio-placeholder.component';
import { Portfolio } from '../../../Models/portfolio';
import { AuthService } from '../../../Services/auth.service';
import { PortfolioService } from '../../../Services/portfolio.service';
import { CreatePortfolioModalComponent } from '../../../Components/Portfolio/create-portfolio-modal.component';

@Component({
  standalone: true,
  selector: 'app-portfolio-list',
  imports: [CommonModule, PortfolioPlaceholderComponent, CreatePortfolioModalComponent],
  templateUrl: './portfolio-list.html',
  styleUrl: './portfolio-list.scss',
})
export class PortfolioList implements OnInit {
  portfolios: Portfolio[] = [];
  isLoading = false;
  error: string | null = null;
  showCreateModal = false;

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
      this.error = 'Leider konnten keine Nutzerdaten geladen werden.';
      return;
    }

    this.isLoading = true;
    this.portfolioService.getPortfoliosByUser(currentUser.id).subscribe({
      next: (data: Portfolio[]) => {
        this.portfolios = data;
        this.isLoading = false;
        this.error = null;
      },
      error: () => {
        this.error = 'Portfolios konnten nicht geladen werden.';
        this.isLoading = false;
      }
    });
  }

  openCreateModal(): void {
    this.showCreateModal = true;
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
  }

  handlePortfolioCreated(portfolio: Portfolio): void {
    this.portfolios = [...this.portfolios, portfolio];
    this.error = null;
  }
}
