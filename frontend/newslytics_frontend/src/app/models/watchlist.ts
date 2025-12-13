export interface WatchlistEntry {
    id: number;
    user_id: number;
    aktie_id: number;
}

export interface CreateWatchlistEntryRequest {
    user_id: number;
    aktie_id: number;
}
