export interface Stock {
    id: number;
    name: string;
    isin: string;
    firma: string;
    ausschüttungsart?: string;
    kategorie?: string;
    land?: string;
    beschreibung?: string;
    ebitda?: number;
    nettogewinn?: number;
    umsatz?: number;
    currency?: string;
    unternehmenswert?: number;
}

export interface Transaction {
    id: number;
    menge: number;
    kaufpreis: number;
    kaufdatum: string;
    aktie_id: number;
    portfolio_id: number;
}
