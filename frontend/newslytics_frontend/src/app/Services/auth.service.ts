import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { User, LoginRequest, AuthResponse, RegisterRequest } from '../Models/auth';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private readonly baseUrl = 'http://localhost:5001/api';

    private _currentUser: User | null = null;
    private _token: string | null = null;

    get currentUser(): User | null {
        return this._currentUser;
    }

    get token(): string | null {
        return this._token;
    }

    constructor(private http: HttpClient) {
        this.restoreFromStorage();
    }

    login(payload: LoginRequest): Observable<AuthResponse> {
        return this.http
            .post<AuthResponse>(`${this.baseUrl}/auth/login`, payload)
            .pipe(tap(res => this.handleAuthSuccess(res)));
    }

    logout(): void {
        this._currentUser = null;
        this._token = null;
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
    }

    register(payload: RegisterRequest): Observable<User> {
        return this.http.post<User>(`${this.baseUrl}/auth/register`, payload);
    }

    private handleAuthSuccess(res: AuthResponse): void {
        this._token = res.access_token;
        this._currentUser = res.user;

        localStorage.setItem('auth_token', res.access_token);
        localStorage.setItem('auth_user', JSON.stringify(res.user));
    }

    private restoreFromStorage(): void {
        const token = localStorage.getItem('auth_token');
        const userStr = localStorage.getItem('auth_user');

        if (token && userStr) {
            try {
                this._token = token;
                this._currentUser = JSON.parse(userStr) as User;
            } catch {
                this.logout();
            }
        }
    }
}