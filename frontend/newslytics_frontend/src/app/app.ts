import { Component, signal } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { LoginModalComponent } from './Components/Auth/login-modal.component';
import { RegisterModalComponent } from './Components/Auth/register-modal.component';
import { CommonModule } from '@angular/common';
import { AuthService } from './Services/auth.service';
import { AuthRequiredModalComponent } from './Components/Auth/auth-required.component';

@Component({
	selector: 'app-root',
	imports: [RouterOutlet, RouterLink, RouterLinkActive, LoginModalComponent, RegisterModalComponent, AuthRequiredModalComponent, CommonModule],
	templateUrl: './app.html',
	styleUrl: './app.scss'
})
export class App {
	protected readonly title = signal('newslytics_frontend');

	constructor(
		public authService: AuthService,
		private router: Router
	) {
		this.authService.authRequired$.subscribe(() => {
			this.showAuthRequiredModal = true;
		});
	}

	showLoginModal = false;
	showRegisterModal = false;
	showAuthRequiredModal = false;

	get isLoggedIn(): boolean {
		return this.authService.isAuthenticated;
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
		this.router.navigate(['/home']);
	}

	handleAuthRequiredClose(): void {
		this.showAuthRequiredModal = false;
	}

	handleAuthRequiredLogin(): void {
		this.showAuthRequiredModal = false;
		this.openLogin();
	}

	handleAuthRequiredRegister(): void {
		this.showAuthRequiredModal = false;
		this.openRegister();
	}
}
