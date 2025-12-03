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

export interface StockQuote {
    symbol: string;
    ticker: string;
    isin?: string;
    shortName?: string;
    longName?: string;
    exchange?: string;
    quoteType?: string;
    currency?: string;
    sector?: string;
    industry?: string;
    regularMarketPrice?: number;
    regularMarketChangePercent?: number;
    [key: string]: any;
}

export interface StockSearchResponse {
    query: string;
    quotes: StockQuote[];
}

export interface TrendingStockResult {
    symbol: string;
    ticker: string;
    shortname?: string;
    longname?: string;
    exchange?: string;
    currency?: string;
    sector?: string;
    industry?: string;
    quoteType?: string;
    regularMarketPrice?: number;
    regularMarketChangePercent?: number;
    isin?: string;
    raw_trending?: any;
}

export interface TrendingStocksResponse {
    region: string;
    count: number;
    results: TrendingStockResult[];
}
