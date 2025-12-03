import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

import { Transaction } from '../../Models/stock';

@Component({
    standalone: true,
    selector: 'app-stock-position',
    imports: [CommonModule],
    templateUrl: './stock-position.component.html',
    styleUrl: './stock-position.component.scss'
})
export class StockPositionComponent {
    @Input({ required: true }) position!: Transaction;
}
