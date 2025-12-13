import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { WatchlistEntry } from '../../../../models/watchlist';
import { Stock } from '../../../../models/stock';
import { AuthService } from '../../../../services/auth.service';
import { WatchlistService } from '../../../../services/watchlist.service';
import { StockService } from '../../../../services/stock.service';
import { SingleStockChatbot } from '../../../../chatbot-windows/single-stock-chatbot/single-stock-chatbot';

interface WatchlistDisplayEntry {
  entry: WatchlistEntry;
  stock: Stock | null;
}

@Component({
  standalone: true,
  selector: 'app-watchlist-detail',
  imports: [CommonModule, SingleStockChatbot],
  templateUrl: './watchlist-detail.html',
  styleUrl: './watchlist-detail.scss',
})
export class WatchlistDetail implements OnInit {
  entries: WatchlistEntry[] = [];
  items: WatchlistDisplayEntry[] = [];
  isLoading = false;
  stocksLoading = false;
  error: string | null = null;
  stocksError: string | null = null;
  chatStock: Stock | null = null;
  private removingIds = new Set<number>();

  constructor(
    private authService: AuthService,
    private watchlistService: WatchlistService,
    private stockService: StockService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const user = this.authService.currentUser;
    if (!user) {
      this.error = 'Watchlist konnte nicht geladen werden.';
      return;
    }

    this.fetchEntries(user.id);
  }

  private fetchEntries(userId: number): void {
    this.isLoading = true;
    this.watchlistService.getEntriesByUser(userId).subscribe({
      next: (entries) => {
        this.entries = entries;
        this.isLoading = false;
        this.error = null;

        if (entries.length > 0) {
          this.loadStocks(entries);
        } else {
          this.items = [];
          this.stocksError = null;
          this.stocksLoading = false;
        }
      },
      error: () => {
        this.entries = [];
        this.isLoading = false;
        this.error = 'Watchlist konnte nicht geladen werden.';
      },
    });
  }

  private loadStocks(entries: WatchlistEntry[]): void {
    this.stocksLoading = true;
    this.stockService.getStocks().subscribe({
      next: (stocks) => {
        const resolved = entries.map((entry) => ({
          entry,
          stock: stocks.find((stock) => stock.id === entry.aktie_id) || null,
        }));

        this.items = resolved;
        this.stocksLoading = false;
        const unresolved = resolved.filter((item) => !item.stock).length;
        this.stocksError = unresolved === 0 ? null : 'Einige Aktien konnten nicht zugeordnet werden.';
      },
      error: () => {
        this.items = [];
        this.stocksLoading = false;
        this.stocksError = 'Aktien konnten nicht geladen werden.';
      },
    });
  }

  goToStocks(): void {
    this.router.navigate(['/stocks']);
  }

  startChat(stock: Stock | null): void {
    if (!stock) {
      this.chatStock = null;
      return;
    }

    this.chatStock = this.chatStock?.id === stock.id ? null : stock;
  }

  clearChat(): void {
    this.chatStock = null;
  }

  removeEntry(entry: WatchlistEntry): void {
    if (this.removingIds.has(entry.id)) {
      return;
    }

    this.removingIds.add(entry.id);
    this.watchlistService.deleteEntry(entry.id).subscribe({
      next: () => {
        this.removingIds.delete(entry.id);
        this.entries = this.entries.filter((existing) => existing.id !== entry.id);
        this.items = this.items.filter((item) => item.entry.id !== entry.id);

        if (this.entries.length === 0) {
          this.stocksError = null;
        }
      },
      error: () => {
        this.removingIds.delete(entry.id);
        this.stocksError = 'Watchlist-Eintrag konnte nicht entfernt werden.';
      },
    });
  }

  isRemoving(entryId: number): boolean {
    return this.removingIds.has(entryId);
  }

  isActiveChat(stock: Stock | null): boolean {
    if (!stock || !this.chatStock) {
      return false;
    }
    return this.chatStock.id === stock.id;
  }
}
