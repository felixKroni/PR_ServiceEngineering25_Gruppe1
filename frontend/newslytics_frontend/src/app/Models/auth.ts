export interface User {
	id: number;
	username: string;
	firstname: string;
	lastname: string;
}

export interface AuthResponse {
	access_token: string;
	user: User;
}

export interface LoginRequest {
	username: string;
	password: string;
}

export interface RegisterRequest {
	username: string;
	firstname: string;
	lastname: string;
	password: string;
}