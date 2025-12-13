import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { PortfolioPlaceholderComponent } from '../../../components/portfolio/portfolio-placeholder.component';
import { CreatePortfolioModalComponent } from '../../../components/portfolio/create-portfolio-modal.component';
import { RenamePortfolioModalComponent } from '../../../components/portfolio/rename-portfolio-modal.component';
import { WatchlistEntryComponent } from '../../../components/Watchlist/watchlist-entry.component';
import { Portfolio } from '../../../models/portfolio';
import { WatchlistEntry } from '../../../models/watchlist';
import { AuthService } from '../../../services/auth.service';
import { PortfolioService } from '../../../services/portfolio.service';
import { WatchlistService } from '../../../services/watchlist.service';

@Component({
  standalone: true,
  selector: 'app-portfolio-list',
  imports: [CommonModule, PortfolioPlaceholderComponent, CreatePortfolioModalComponent, RenamePortfolioModalComponent, WatchlistEntryComponent],
  templateUrl: './portfolio-list.html',
  styleUrl: './portfolio-list.scss',
})
export class PortfolioList implements OnInit {
  portfolios: Portfolio[] = [];
  watchlistEntries: WatchlistEntry[] = [];
  isLoading = false;
  watchlistLoading = false;
  error: string | null = null;
  watchlistError: string | null = null;
  showCreateModal = false;
  showRenameModal = false;
  renameTarget: Portfolio | null = null;
  renameSaving = false;
  renameServerError: string | null = null;
  deletingIds = new Set<number>();

  constructor(
    private portfolioService: PortfolioService,
    private authService: AuthService,
    private watchlistService: WatchlistService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const currentUser = this.authService.currentUser;
    if (!currentUser) {
      this.error = 'Leider konnten keine Nutzerdaten geladen werden.';
      return;
    }

    this.loadPortfolios(currentUser.id);
    this.loadWatchlist(currentUser.id);
  }

  private loadPortfolios(userId: number): void {
    this.isLoading = true;
    this.portfolioService.getPortfoliosByUser(userId).subscribe({
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

  private loadWatchlist(userId: number): void {
    this.watchlistLoading = true;
    this.watchlistService.getEntriesByUser(userId).subscribe({
      next: (entries) => {
        this.watchlistEntries = entries;
        this.watchlistLoading = false;
        this.watchlistError = null;
      },
      error: () => {
        this.watchlistEntries = [];
        this.watchlistLoading = false;
        this.watchlistError = 'Watchlist konnte nicht geladen werden.';
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

  openWatchlist(): void {
    if (this.watchlistEntries.length === 0) {
      this.router.navigate(['/stocks']);
      return;
    }

    this.router.navigate(['/watchlist-detail']);
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
