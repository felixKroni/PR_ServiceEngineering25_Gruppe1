import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { LoginModalComponent } from './Components/Auth/login-modal.component';
import { RegisterModalComponent } from './Components/Auth/register-modal.component';
import { CommonModule } from '@angular/common';
import { AuthService } from './Services/auth.service';

@Component({
	selector: 'app-root',
	imports: [RouterOutlet, RouterLink, RouterLinkActive, LoginModalComponent, RegisterModalComponent, CommonModule],
	templateUrl: './app.html',
	styleUrl: './app.scss'
})
export class App {
	protected readonly title = signal('newslytics_frontend');

	constructor(public authService: AuthService) { }

	showLoginModal = false;
	showRegisterModal = false;

	get isLoggedIn(): boolean {
		return !!this.authService.currentUser;
	}

	openLogin(): void {
		this.showLoginModal = true;
	}

	openRegister(): void {
		this.showRegisterModal = true;
	}

	closeLogin(): void {
		this.showLoginModal = false;
	}

	closeRegister(): void {
		this.showRegisterModal = false;
	}

	logout(): void {
		this.authService.logout();
	}
}
