// Authentication Types for Bayanihan Exchange

export interface User {
	id: string;
	email: string;
	name: string;
	isVerified: boolean;
	role: 'user' | 'admin' | 'moderator';
	createdAt: Date;
	lastLoginAt?: Date;
}

export interface AuthResponse {
	success: boolean;
	user?: User;
	token?: string;
	message?: string;
	errors?: string[];
}

export interface LoginCredentials {
	email: string;
	password: string;
	rememberMe?: boolean;
}

export interface SignUpCredentials {
	name: string;
	email: string;
	password: string;
	confirmPassword: string;
}

export interface AuthState {
	isAuthenticated: boolean;
	user: User | null;
	isLoading: boolean;
	error: string | null;
}

export interface FormState {
	isSignUp: boolean;
	isLoading: boolean;
	errors: Record<string, string>;
}

export interface ValidationErrors {
	email?: string;
	password?: string;
	name?: string;
	confirmPassword?: string;
}

export type AuthMode = 'signin' | 'signup';

export interface SocialLoginProvider {
	name: 'google' | 'apple' | 'facebook';
	icon: string;
	label: string;
}
