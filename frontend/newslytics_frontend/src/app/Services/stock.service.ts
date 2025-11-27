import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../config';
import { Stock, Transaction } from '../Models/stock';

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
}
