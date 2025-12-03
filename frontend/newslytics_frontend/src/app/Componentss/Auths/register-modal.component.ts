import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RegisterRequest, LoginRequest } from '../../Models/auth';
import { AuthService } from '../../services/auth.service';

@Component({
    standalone: true,
    selector: 'app-register-modal',
    imports: [CommonModule, FormsModule],
    templateUrl: './register-modal.component.html',
    styleUrls: ['./register-modal.component.scss']
})
export class RegisterModalComponent {
    @Output() close = new EventEmitter<void>();

    username = '';
    firstname = '';
    lastname = '';
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

        const payload: RegisterRequest = {
            username: this.username,
            password: this.password,
            firstname: this.firstname,
            lastname: this.lastname
        };

        this.authService.register(payload).subscribe({
            next: () => {
                const loginPayload: LoginRequest = {
                    username: this.username,
                    password: this.password
                };

                this.authService.login(loginPayload).subscribe({
                    next: () => {
                        this.loading = false;
                        this.close.emit();
                    },
                    error: (err) => {
                        this.loading = false;
                        this.error = 'Account created, but login failed.';
                    }
                });
            },
            error: (err) => {
                console.error('Register failed', err);
                this.loading = false;
                this.error = 'Register failed. Try another name!';
            }
        });
    }

    private paramValidate(): boolean {
        const username = this.username.trim();
        const firstname = this.firstname.trim();
        const lastname = this.lastname.trim();
        const password = this.password;

        if (!username || !firstname || !lastname || !password) {
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

        if (firstname.length < 2 || lastname.length < 2) {
            this.error = 'First and last name must be at least 2 characters.';
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