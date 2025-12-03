import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

import { Portfolio } from '../../models/portfolio';

@Component({
    standalone: true,
    selector: 'app-portfolio-placeholder',
    imports: [CommonModule],
    templateUrl: './portfolio-placeholder.component.html',
    styleUrl: './portfolio-placeholder.component.scss'
})
export class PortfolioPlaceholderComponent {
    @Input({ required: true }) portfolio!: Portfolio;
    @Input() renaming = false;
    @Input() deleting = false;

    @Output() open = new EventEmitter<number>();
    @Output() rename = new EventEmitter<Portfolio>();
    @Output() delete = new EventEmitter<Portfolio>();

    openPortfolio(): void {
        this.open.emit(this.portfolio.id);
    }

    requestRename(): void {
        this.rename.emit(this.portfolio);
    }

    requestDelete(): void {
        this.delete.emit(this.portfolio);
    }
}
