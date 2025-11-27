import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { PortfolioService } from '../../Services/portfolio.service';
import { AuthService } from '../../Services/auth.service';
import { Portfolio } from '../../Models/portfolio';

@Component({
    standalone: true,
    selector: 'app-create-portfolio-modal',
    imports: [CommonModule, FormsModule],
    templateUrl: './create-portfolio-modal.component.html',
    styleUrl: './create-portfolio-modal.component.scss'
})
export class CreatePortfolioModalComponent {
    @Output() close = new EventEmitter<void>();
    @Output() created = new EventEmitter<Portfolio>();

    name = '';
    loading = false;
    error: string | null = null;

    constructor(
        private portfolioService: PortfolioService,
        private authService: AuthService
    ) {}

    submit(): void {
        this.error = null;
        const trimmedName = this.name.trim();

        if (!trimmedName) {
            this.error = 'Bitte einen Namen vergeben.';
            return;
        }

        const user = this.authService.currentUser;
        if (!user) {
            this.error = 'Kein angemeldeter Benutzer gefunden.';
            return;
        }

        this.loading = true;
        this.portfolioService.addPortfolio({
            name: trimmedName,
            user_id: user.id
        }).subscribe({
            next: (portfolio: Portfolio) => {
                this.loading = false;
                this.created.emit(portfolio);
                this.close.emit();
            },
            error: () => {
                this.loading = false;
                this.error = 'Portfolio konnte nicht erstellt werden.';
            }
        });
    }

    onOverlayClick(event: MouseEvent): void {
        if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
            this.close.emit();
        }
    }
}
