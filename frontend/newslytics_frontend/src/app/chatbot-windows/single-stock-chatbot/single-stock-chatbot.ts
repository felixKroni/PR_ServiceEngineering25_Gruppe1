import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Stock, StockQuote, TrendingStockResult } from '../../models/stock';
import {
  StockChatbotService,
  StockChatMessage,
} from '../../services/stock-chatbot.service';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

@Component({
  selector: 'app-single-stock-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './single-stock-chatbot.html',
  styleUrl: './single-stock-chatbot.scss',
})
export class SingleStockChatbot implements OnChanges {
  @Input() stock: (Stock | StockQuote | TrendingStockResult) | null = null;

  messages: ChatMessage[] = [];
  inputValue = '';
  loading = false;
  error: string | null = null;
  private currentStockKey: string | null = null;

  constructor(private chatbotService: StockChatbotService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['stock']) {
      this.resetForNewStock();
    }
  }

  sendMessage(): void {
    if (!this.stock) {
      return;
    }

    const trimmed = this.inputValue.trim();
    if (!trimmed || this.loading) {
      return;
    }

    const userMessage = this.createMessage('user', trimmed);
    this.messages = [...this.messages, userMessage];
    this.inputValue = '';
    this.loading = true;
    this.error = null;

    const payload: StockChatMessage[] = this.messages.map((message) => ({
      sender: message.sender,
      text: message.text,
    }));

    this.chatbotService
      .sendMessage({
        stock: this.chatbotService.buildStockContext(this.stock),
        message: trimmed,
        history: payload,
      })
      .subscribe({
        next: (response) => {
          const assistantMessage = this.createMessage('assistant', response.reply, response.timestamp);
          this.messages = [...this.messages, assistantMessage];
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.error = 'Konversation konnte nicht fortgesetzt werden.';
        },
      });
  }

  get placeholder(): string {
    if (!this.stock) {
      return 'Bitte zuerst eine Aktie auswählen.';
    }
    return 'Frage zu dieser Aktie stellen';
  }

  get stockTitle(): string {
    return this.stock ? this.stockLabel(this.stock) : 'Keine Aktie ausgewählt';
  }

  private resetForNewStock(): void {
    const nextKey = this.buildStockKey(this.stock);
    if (nextKey === this.currentStockKey) {
      return;
    }

    this.currentStockKey = nextKey;
    this.inputValue = '';
    this.error = null;
    this.loading = false;
    this.messages = [];

    if (this.stock) {
      const intro = `Ich beantworte Fragen rund um ${this.stockLabel(this.stock)}. Was möchtest du wissen?`;
      this.messages = [this.createMessage('assistant', intro)];
    }
  }

  private createMessage(sender: 'user' | 'assistant', text: string, timestamp?: string): ChatMessage {
    return {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      sender,
      text,
      timestamp: timestamp || new Date().toISOString(),
    };
  }

  private buildStockKey(stock: (Stock | StockQuote | TrendingStockResult) | null): string | null {
    if (!stock) {
      return null;
    }
    const identifier =
      stock.isin ||
      ('symbol' in stock ? stock.symbol : undefined) ||
      ('ticker' in stock ? stock.ticker : undefined) ||
      ('shortName' in stock ? stock.shortName : undefined) ||
      ('shortname' in stock ? stock.shortname : undefined) ||
      ('name' in stock ? stock.name : undefined);
    return identifier || null;
  }

  private stockLabel(stock: Stock | StockQuote | TrendingStockResult): string {
    return (
      ('name' in stock ? stock.name : undefined) ||
      ('shortName' in stock ? stock.shortName : undefined) ||
      ('shortname' in stock ? stock.shortname : undefined) ||
      ('longName' in stock ? stock.longName : undefined) ||
      ('longname' in stock ? stock.longname : undefined) ||
      ('symbol' in stock ? stock.symbol : undefined) ||
      ('ticker' in stock ? stock.ticker : undefined) ||
      stock.isin ||
      'dieser Aktie'
    );
  }
}
