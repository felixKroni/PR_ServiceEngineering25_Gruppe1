import { Component } from '@angular/core';
import { StockSearchbar } from '../../../components/stock/stock-searchbar/stock-searchbar.component';
import { StockQuote, TrendingStockResult } from '../../../models/stock';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stock-overview',
  imports: [CommonModule, StockSearchbar],
  templateUrl: './stock-overview.html',
  styleUrl: './stock-overview.scss',
})
export class StockOverview {
  selectedStock: StockQuote | TrendingStockResult | null = null;

  onStockSelected(stock: StockQuote | TrendingStockResult): void {
    this.selectedStock = stock;
    console.log('Selected stock:', stock);
    // Add your logic here (e.g., navigate to stock detail page, show more info, etc.)
  }

  isStockQuote(stock: StockQuote | TrendingStockResult): stock is StockQuote {
    return 'shortName' in stock || 'longName' in stock;
  }

  isTrendingStock(stock: StockQuote | TrendingStockResult): stock is TrendingStockResult {
    return 'shortname' in stock || 'longname' in stock;
  }
}
