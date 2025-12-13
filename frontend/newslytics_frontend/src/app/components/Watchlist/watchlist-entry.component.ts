import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    standalone: true,
    selector: 'app-watchlist-entry',
    imports: [CommonModule],
    templateUrl: './watchlist-entry.component.html',
    styleUrl: './watchlist-entry.component.scss'
})
export class WatchlistEntryComponent {
    @Input() entryCount: number | null = null;
    @Input() loading = false;
    @Output() open = new EventEmitter<void>();

    openWatchlist(): void {
        if (this.loading) {
            return;
        }
        this.open.emit();
    }

    get statusText(): string {
        if (this.loading) {
            return 'Watchlist wird geladen …';
        }
        if (this.entryCount === null) {
            return 'Watchlist ist bereit.';
        }
        if (this.entryCount === 0) {
            return 'Noch keine Aktien gemerkt.';
        }
        if (this.entryCount === 1) {
            return '1 Aktie';
        }
        return `${this.entryCount} Aktien`;
    }
}
