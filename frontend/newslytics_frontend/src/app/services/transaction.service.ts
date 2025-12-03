import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../config';
import { Transaction, CreateTransactionRequest, UpdateTransactionRequest } from '../models/transactions';

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  private readonly baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  /**
   * Get all transactions
   */
  getAllTransactions(): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.baseUrl}/transaktionen`);
  }

  /**
   * Get all transactions for a specific portfolio
   */
  getTransactionsByPortfolio(portfolioId: number): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.baseUrl}/portfolios/${portfolioId}/transaktionen`);
  }

  /**
   * Create a new transaction
   */
  createTransaction(transaction: CreateTransactionRequest): Observable<Transaction> {
    return this.http.post<Transaction>(`${this.baseUrl}/transaktionen`, transaction);
  }

  /**
   * Update an existing transaction
   */
  updateTransaction(transactionId: number, updates: UpdateTransactionRequest): Observable<Transaction> {
    return this.http.put<Transaction>(`${this.baseUrl}/transaktionen/${transactionId}`, updates);
  }

  /**
   * Delete a transaction
   */
  deleteTransaction(transactionId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/transaktionen/${transactionId}`);
  }
}
