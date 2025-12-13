import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, switchMap, of, catchError } from 'rxjs';
import { StockService } from '../../../services/stock.service';
import { StockQuote, TrendingStockResult } from '../../../models/stock';

@Component({
    standalone: true,
    selector: 'app-stock-searchbar',
    imports: [CommonModule, FormsModule],
    templateUrl: './stock-searchbar.component.html',
    styleUrls: ['./stock-searchbar.component.scss']
})
export class StockSearchbar implements OnInit {
    @Output() stockSelected = new EventEmitter<StockQuote | TrendingStockResult>();

    searchQuery = '';
    searchResults: StockQuote[] = [];
    trendingStocks: TrendingStockResult[] = [];
    loading = false;
    error: string | null = null;
    showResults = false;

    dummyISIN = true;

    private searchSubject = new Subject<string>();

    constructor(private stockService: StockService) {}

    ngOnInit(): void {
        this.loadTrendingStocks();
        this.setupSearch();
    }

    private setupSearch(): void {
        this.searchSubject
            .pipe(
                debounceTime(300),
                distinctUntilChanged(),
                switchMap(query => {
                    if (!query || query.trim().length < 2) {
                        return of({ query: '', quotes: [] });
                    }
                    this.loading = true;
                    this.error = null;
                    return this.stockService.searchStocks(query).pipe(
                        catchError(err => {
                            this.error = 'Failed to search stocks';
                            console.error('Search error:', err);
                            return of({ query: '', quotes: [] });
                        })
                    );
                })
            )
            .subscribe(response => {
                this.searchResults = response.quotes;
                if(this.dummyISIN === true){
                    this.searchResults.forEach(result => {
                        result.isin = 'ISIN' + Math.random().toString(36).substring(2, 12).toUpperCase();
                    });
                }
                this.loading = false;
            });
    }

    private loadTrendingStocks(): void {
        this.stockService.getTrendingStocks('US').subscribe({
            next: response => {
                this.trendingStocks = response.results.slice(0, 5);
                if(this.dummyISIN === true){
                    this.trendingStocks.forEach(result => {
                        result.isin = 'ISIN' + Math.random().toString(36).substring(2, 12).toUpperCase();
                    });
                }
            },
            error: err => {
                console.error('Failed to load trending stocks:', err);
            }
        });
    }

    onSearchInput(): void {
        this.showResults = true;
        this.searchSubject.next(this.searchQuery);
    }

    selectStock(stock: StockQuote | TrendingStockResult): void {
        this.stockSelected.emit(stock);
        this.searchQuery = '';
        this.searchResults = [];
        this.showResults = false;
    }

    onFocus(): void {
        this.showResults = true;
    }

    onBlur(): void {
        setTimeout(() => {
            this.showResults = false;
        }, 200);
    }

    clearSearch(): void {
        this.searchQuery = '';
        this.searchResults = [];
        this.error = null;
    }
}
