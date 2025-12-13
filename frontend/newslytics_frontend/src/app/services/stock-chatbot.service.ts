import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../config';
import { Stock, StockQuote, TrendingStockResult } from '../models/stock';

export type ChatbotSender = 'user' | 'assistant';

export interface StockChatMessage {
  sender: ChatbotSender;
  text: string;
}

export interface StockChatRequest {
  stock: StockContextPayload;
  message: string;
  history: StockChatMessage[];
}

export interface StockChatResponse {
  reply: string;
  timestamp: string;
}

export interface StockContextPayload {
  symbol?: string;
  ticker?: string;
  isin?: string;
  name?: string;
  shortName?: string;
  longName?: string;
  currency?: string;
  exchange?: string;
}

@Injectable({ providedIn: 'root' })
export class StockChatbotService {
  private readonly baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  sendMessage(payload: StockChatRequest): Observable<StockChatResponse> {
    return this.http.post<StockChatResponse>(`${this.baseUrl}/chatbot/stock`, payload);
  }

  buildStockContext(stock: Stock | StockQuote | TrendingStockResult): StockContextPayload {
    const payload: StockContextPayload = {};

    if ('symbol' in stock && stock.symbol) {
      payload.symbol = stock.symbol;
    }

    if ('ticker' in stock && stock.ticker) {
      payload.ticker = stock.ticker;
    }

    if (stock.isin) {
      payload.isin = stock.isin;
    }

    if ('name' in stock && stock.name) {
      payload.name = stock.name;
    }

    if ('shortName' in stock && stock.shortName) {
      payload.shortName = stock.shortName;
    }

    if (!payload.shortName && 'shortname' in stock && stock.shortname) {
      payload.shortName = stock.shortname;
    }

    if ('longName' in stock && stock.longName) {
      payload.longName = stock.longName;
    }

    if (!payload.longName && 'longname' in stock && stock.longname) {
      payload.longName = stock.longname;
    }

    if (stock.currency) {
      payload.currency = stock.currency;
    }

    if ('exchange' in stock && stock.exchange) {
      payload.exchange = stock.exchange;
    }

    return payload;
  }
}
