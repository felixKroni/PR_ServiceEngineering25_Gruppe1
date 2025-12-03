import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { CreatePortfolioRequest, Portfolio } from '../models/portfolio';
import { environment } from '../config';

@Injectable({
	providedIn: 'root'
})
export class PortfolioService {
	private readonly baseUrl = environment.apiBaseUrl;

	constructor(
		private http: HttpClient
	) {}

	getPortfolios(): Observable<Portfolio[]> {
		return this.http.get<Portfolio[]>(`${this.baseUrl}/portfolios`);
	}

	getPortfolio(id: number): Observable<Portfolio> {
		return this.http.get<Portfolio>(`${this.baseUrl}/portfolios/${id}`);
	}

	addPortfolio(payload: CreatePortfolioRequest): Observable<Portfolio> {
		return this.http.post<Portfolio>(`${this.baseUrl}/portfolios`, payload);
	}

	renamePortfolio(id: number, name: string): Observable<Portfolio> {
		return this.http.put<Portfolio>(`${this.baseUrl}/portfolios/${id}`, { name });
	}

	deletePortfolio(id: number): Observable<{ message: string }> {
		return this.http.delete<{ message: string }>(`${this.baseUrl}/portfolios/${id}`);
	}

	getPortfoliosByUser(userId: number): Observable<Portfolio[]> {
		return this.http.get<Portfolio[]>(`${this.baseUrl}/users/${userId}/portfolios`);
	}
}
