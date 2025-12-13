import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../config';
import { CreateWatchlistEntryRequest, WatchlistEntry } from '../models/watchlist';

@Injectable({
    providedIn: 'root'
})
export class WatchlistService {
    private readonly baseUrl = environment.apiBaseUrl;

    constructor(private http: HttpClient) {}

    getEntries(): Observable<WatchlistEntry[]> {
        return this.http.get<WatchlistEntry[]>(`${this.baseUrl}/watchlist`);
    }

    getEntriesByUser(userId: number): Observable<WatchlistEntry[]> {
        return this.http.get<WatchlistEntry[]>(`${this.baseUrl}/watchlist/user/${userId}`);
    }

    addEntry(payload: CreateWatchlistEntryRequest): Observable<WatchlistEntry> {
        return this.http.post<WatchlistEntry>(`${this.baseUrl}/watchlist`, payload);
    }

    deleteEntry(entryId: number): Observable<{ message: string }> {
        return this.http.delete<{ message: string }>(`${this.baseUrl}/watchlist/${entryId}`);
    }
}
