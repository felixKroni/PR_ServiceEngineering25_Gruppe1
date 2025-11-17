import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-auth-required-modal',
  imports: [CommonModule],
  templateUrl: './auth-required.component.html',
  styleUrls: ['./auth-required.component.scss']
})
export class AuthRequiredModalComponent {
  @Output() close = new EventEmitter<void>();
  @Output() login = new EventEmitter<void>();
  @Output() register = new EventEmitter<void>();

  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.close.emit();
    }
  }
}
