import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, SimpleChanges, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
    standalone: true,
    selector: 'app-rename-portfolio-modal',
    imports: [CommonModule, FormsModule],
    templateUrl: './rename-portfolio-modal.component.html',
    styleUrl: './rename-portfolio-modal.component.scss'
})
export class RenamePortfolioModalComponent implements OnChanges {
    @Input({ required: true }) currentName = '';
    @Input() saving = false;
    @Input() serverError: string | null = null;
    @Output() close = new EventEmitter<void>();
    @Output() save = new EventEmitter<string>();

    name = '';
    validationError: string | null = null;

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['currentName']) {
            this.name = this.currentName;
        }
    }

    submit(): void {
        const trimmed = this.name.trim();
        if (!trimmed) {
            this.validationError = 'Bitte einen Namen eingeben.';
            return;
        }
        this.validationError = null;
        this.save.emit(trimmed);
    }

    onOverlayClick(event: MouseEvent): void {
        if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
            this.close.emit();
        }
    }
}
