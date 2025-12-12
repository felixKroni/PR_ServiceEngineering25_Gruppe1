import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { StockService } from '../../../services/stock.service';
import { TrendingStockResult } from '../../../models/stock';

@Component({
  standalone: true,
  selector: 'app-stock-homepage',
  imports: [CommonModule],
  templateUrl: './stock-homepage.component.html',
  styleUrl: './stock-homepage.component.scss',
})
export class StockHomepage implements OnInit {
  trendingStocks: TrendingStockResult[] = [];
  loading = true;
  error: string | null = null;

  constructor(private stockService: StockService) {}

  ngOnInit(): void {
    this.loadTrendingStocks();
  }

  private loadTrendingStocks(): void {
    this.stockService.getTrendingStocks('US').subscribe({
      next: (response) => {
        this.trendingStocks = response.results.slice(0, 8); // Show top 8
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load trending stocks:', err);
        this.error = 'Fehler beim Laden der Trending-Aktien';
        this.loading = false;
      }
    });
  }

  getChangeClass(changePercent: number | undefined): string {
    if (!changePercent) return '';
    return changePercent > 0 ? 'positive' : 'negative';
  }

  formatChange(changePercent: number | undefined): string {
    if (!changePercent) return 'N/A';
    const sign = changePercent > 0 ? '+' : '';
    return `${sign}${changePercent.toFixed(2)}%`;
  }
}
