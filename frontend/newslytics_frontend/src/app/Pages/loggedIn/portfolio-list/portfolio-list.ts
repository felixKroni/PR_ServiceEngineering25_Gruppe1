import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { PortfolioPlaceholderComponent } from '../../../Components/Portfolio/portfolio-placeholder.component';
import { CreatePortfolioModalComponent } from '../../../Components/Portfolio/create-portfolio-modal.component';
import { RenamePortfolioModalComponent } from '../../../Components/Portfolio/rename-portfolio-modal.component';
import { Portfolio } from '../../../Models/portfolio';
import { AuthService } from '../../../Services/auth.service';
import { PortfolioService } from '../../../Services/portfolio.service';

@Component({
  standalone: true,
  selector: 'app-portfolio-list',
  imports: [CommonModule, PortfolioPlaceholderComponent, CreatePortfolioModalComponent, RenamePortfolioModalComponent],
  templateUrl: './portfolio-list.html',
  styleUrl: './portfolio-list.scss',
})
export class PortfolioList implements OnInit {
  portfolios: Portfolio[] = [];
  isLoading = false;
  error: string | null = null;
  showCreateModal = false;
  showRenameModal = false;
  renameTarget: Portfolio | null = null;
  renameSaving = false;
  renameServerError: string | null = null;
  deletingIds = new Set<number>();

  constructor(
    private portfolioService: PortfolioService,
    private authService: AuthService,
    private router: Router
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

  openPortfolio(id: number): void {
    this.router.navigate(['/portfolio', id]);
  }

  requestRename(portfolio: Portfolio): void {
    this.renameTarget = portfolio;
    this.renameServerError = null;
    this.showRenameModal = true;
  }

  closeRenameModal(): void {
    this.showRenameModal = false;
    this.renameTarget = null;
    this.renameSaving = false;
    this.renameServerError = null;
  }

  saveRename(newName: string): void {
    if (!this.renameTarget) {
      return;
    }
    this.renameSaving = true;
    this.portfolioService.renamePortfolio(this.renameTarget.id, newName).subscribe({
      next: (updated) => {
        this.portfolios = this.portfolios.map((p) =>
          p.id === updated.id ? { ...p, name: updated.name } : p
        );
        this.renameSaving = false;
        this.closeRenameModal();
      },
      error: () => {
        this.renameSaving = false;
        this.renameServerError = 'Umbenennen fehlgeschlagen.';
      }
    });
  }

  handleDelete(portfolio: Portfolio): void {
    const confirmed = window.confirm(`Portfolio "${portfolio.name}" löschen?`);
    if (!confirmed) {
      return;
    }
    this.deletingIds.add(portfolio.id);
    this.portfolioService.deletePortfolio(portfolio.id).subscribe({
      next: () => {
        this.portfolios = this.portfolios.filter((p) => p.id !== portfolio.id);
        this.deletingIds.delete(portfolio.id);
      },
      error: () => {
        this.deletingIds.delete(portfolio.id);
        this.error = 'Löschen fehlgeschlagen.';
      }
    });
  }

  isDeleting(id: number): boolean {
    return this.deletingIds.has(id);
  }
}
