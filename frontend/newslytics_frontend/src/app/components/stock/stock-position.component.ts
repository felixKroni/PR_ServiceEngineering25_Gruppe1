import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Transaction } from '../../models/transactions';
import { Stock } from '../../models/stock';
import { StockService } from '../../services/stock.service';

@Component({
    standalone: true,
    selector: 'app-stock-position',
    imports: [CommonModule],
    templateUrl: './stock-position.component.html',
    styleUrl: './stock-position.component.scss'
})
export class StockPositionComponent implements OnInit {
    @Input({ required: true }) transaction!: Transaction;
    @Output() editClick = new EventEmitter<Transaction>();
    
    stock: Stock | null = null;
    loading = true;
    error: string | null = null;

    constructor(private stockService: StockService) {}

    ngOnInit(): void {
        this.loadStock();
    }

    private loadStock(): void {
        this.stockService.getStock(this.transaction.aktie_id).subscribe({
            next: (stock) => {
                this.stock = stock;
                this.loading = false;
            },
            error: (err) => {
                console.error('Failed to load stock:', err);
                this.error = 'Failed to load stock details';
                this.loading = false;
            }
        });
    }

    get totalValue(): number {
        return this.transaction.menge * this.transaction.kaufpreis;
    }

    onCardClick(): void {
        this.editClick.emit(this.transaction);
    }
}
