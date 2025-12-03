export interface Transaction {
    id: number;
    menge: number;
    kaufpreis: number;
    kaufdatum: string;
    aktie_id: number;
    portfolio_id: number;
}

export interface CreateTransactionRequest {
    menge: number;
    kaufpreis: number;
    kaufdatum: string;
    aktie_id: number;
    portfolio_id: number;
}

export interface UpdateTransactionRequest {
    menge?: number;
    kaufpreis?: number;
    kaufdatum?: string;
    aktie_id?: number;
    portfolio_id?: number;
}
