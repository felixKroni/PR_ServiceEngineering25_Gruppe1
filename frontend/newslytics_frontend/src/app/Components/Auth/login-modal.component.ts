import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoginRequest } from '../../Models/auth';
import { AuthService } from '../../Services/auth.service';

@Component({
    standalone: true,
    selector: 'app-login-modal',
    imports: [CommonModule, FormsModule],
    templateUrl: './login-modal.component.html',
    styleUrls: ['./login-modal.component.scss']
})
export class LoginModalComponent {
    @Output() close = new EventEmitter<void>();

    username = '';
    password = '';
    loading = false;
    error: string | null = null;

    constructor(private authService: AuthService) { }

    submit(): void {

        this.error = null;

        if (!this.paramValidate()) {
            return;
        }

        this.loading = true;

        const payload: LoginRequest = {
            username: this.username,
            password: this.password
        };

        this.authService.login(payload).subscribe({
            next: () => {
                this.loading = false;
                console.log('Login success');
                this.close.emit();
            },
            error: (err) => {
                console.error('Login failed', err);
                this.loading = false;
                this.error = 'Login failed. Check Credentials!';
            }
        });
    }


    private paramValidate(): boolean {
        const username = this.username.trim();
        const password = this.password;

        if (!username || !password) {
            this.error = 'Please fill in all fields.';
            return false;
        }

        if (username.length < 3) {
            this.error = 'Username must be at least 3 characters long.';
            return false;
        }

        if (password.length < 6) {
            this.error = 'Password must be at least 6 characters long.';
            return false;
        }

        return true;
    }


    onOverlayClick(event: MouseEvent): void {
        if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
            this.close.emit();
        }
    }
}