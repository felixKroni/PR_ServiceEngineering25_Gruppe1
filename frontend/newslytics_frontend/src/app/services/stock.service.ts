import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../config';
import { 
    Stock, 
    Transaction, 
    StockSearchResponse, 
    TrendingStocksResponse 
} from '../models/stock';

@Injectable({
    providedIn: 'root'
})
export class StockService {
    private readonly baseUrl = environment.apiBaseUrl;

    constructor(private http: HttpClient) {}

    getStocks(): Observable<Stock[]> {
        return this.http.get<Stock[]>(`${this.baseUrl}/aktien`);
    }

    getStock(id: number): Observable<Stock> {
        return this.http.get<Stock>(`${this.baseUrl}/aktien/${id}`);
    }

    getTransactions(): Observable<Transaction[]> {
        return this.http.get<Transaction[]>(`${this.baseUrl}/transaktionen`);
    }

    getTransactionsByPortfolio(portfolioId: number): Observable<Transaction[]> {
        return this.http.get<Transaction[]>(`${this.baseUrl}/portfolios/${portfolioId}/transaktionen`);
    }

    searchStocks(query: string): Observable<StockSearchResponse> {
        const params = new HttpParams().set('name', query);
        return this.http.get<StockSearchResponse>(`${this.baseUrl}/aktie/search`, { params });
    }

    getTrendingStocks(region: string = 'US'): Observable<TrendingStocksResponse> {
        const params = new HttpParams().set('region', region);
        return this.http.get<TrendingStocksResponse>(`${this.baseUrl}/aktie/trending`, { params });
    }
}
