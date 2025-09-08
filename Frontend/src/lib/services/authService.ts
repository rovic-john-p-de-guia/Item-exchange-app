import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { API_BASE_URL } from '../config/api';
import type { 
    User, 
    AuthResponse, 
    LoginCredentials, 
    SignUpCredentials 
} from '../types/auth';

// Browser-compatible database using localStorage
class BrowserDatabase {
    private getUsers(): User[] {
        const users = localStorage.getItem('bayanihan_users');
        return users ? JSON.parse(users) : [];
    }

    private saveUsers(users: User[]): void {
        localStorage.setItem('bayanihan_users', JSON.stringify(users));
    }

    private getSessions(): Array<{ userId: string; token: string; expiresAt: string }> {
        const sessions = localStorage.getItem('bayanihan_sessions');
        return sessions ? JSON.parse(sessions) : [];
    }

    private saveSessions(sessions: Array<{ userId: string; token: string; expiresAt: string }>): void {
        localStorage.setItem('bayanihan_sessions', JSON.stringify(sessions));
    }

    public createUser(userData: {
        name: string;
        email: string;
        passwordHash: string;
        role?: string;
    }): User | null {
        try {
            const users = this.getUsers();
            
            // Check if user already exists
            if (users.find(u => u.email === userData.email)) {
                return null;
            }

            const newUser: User = {
                id: uuidv4(),
                email: userData.email,
                name: userData.name,
                isVerified: false,
                role: (userData.role as 'user' | 'admin' | 'moderator') || 'user',
                createdAt: new Date(),
                lastLoginAt: undefined
            };

            // Store password hash separately
            const userWithHash = { ...newUser, passwordHash: userData.passwordHash };
            users.push(userWithHash);
            this.saveUsers(users);

            return newUser;
        } catch (error) {
            console.error('Error creating user:', error);
            return null;
        }
    }

    public getUserByEmail(email: string): User | null {
        try {
            const users = this.getUsers();
            const user = users.find(u => u.email === email);
            return user || null;
        } catch (error) {
            console.error('Error getting user by email:', error);
            return null;
        }
    }

    public getUserById(id: string): User | null {
        try {
            const users = this.getUsers();
            const user = users.find(u => u.id === id);
            return user || null;
        } catch (error) {
            console.error('Error getting user by id:', error);
            return null;
        }
    }

    public getUserPasswordHash(email: string): string | null {
        try {
            const users = this.getUsers();
            const user = users.find(u => u.email === email);
            return (user as User & { passwordHash?: string })?.passwordHash || null;
        } catch (error) {
            console.error('Error getting password hash:', error);
            return null;
        }
    }

    public updateUserLastLogin(userId: string): void {
        try {
            const users = this.getUsers();
            const userIndex = users.findIndex(u => u.id === userId);
            if (userIndex !== -1) {
                users[userIndex].lastLoginAt = new Date();
                this.saveUsers(users);
            }
        } catch (error) {
            console.error('Error updating last login:', error);
        }
    }

    public createSession(userId: string, token: string, expiresAt: Date): void {
        try {
            const sessions = this.getSessions();
            sessions.push({
                userId,
                token,
                expiresAt: expiresAt.toISOString()
            });
            this.saveSessions(sessions);
        } catch (error) {
            console.error('Error creating session:', error);
        }
    }

    public getSessionByToken(token: string): { userId: string; expiresAt: Date } | null {
        try {
            const sessions = this.getSessions();
            const session = sessions.find(s => s.token === token);
            
            if (!session) return null;

            return {
                userId: session.userId,
                expiresAt: new Date(session.expiresAt)
            };
        } catch (error) {
            console.error('Error getting session:', error);
            return null;
        }
    }

    public deleteSession(token: string): void {
        try {
            const sessions = this.getSessions();
            const filteredSessions = sessions.filter(s => s.token !== token);
            this.saveSessions(filteredSessions);
        } catch (error) {
            console.error('Error deleting session:', error);
        }
    }
}

const database = new BrowserDatabase();

class AuthService {
    /**
     * Sign in user with email and password
     */
    async signIn(credentials: LoginCredentials): Promise<AuthResponse> {
        try {
            // Backend login (OAuth2 password form)
            const res = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({ username: credentials.email, password: credentials.password })
            });
            if (!res.ok) {
                return { success: false, message: 'Invalid email or password', errors: ['Invalid credentials'] };
            }
            const data = await res.json();
            const { user: apiUser, token } = data;
            const user = {
                id: apiUser.id,
                email: apiUser.email,
                name: apiUser.name,
                isVerified: true,
                role: 'user' as const,
                createdAt: new Date(),
                lastLoginAt: new Date()
            };
            
            if (!user) {
                return {
                    success: false,
                    message: 'Invalid email or password',
                    errors: ['Invalid credentials'],
                };
            }

            // Store token
            localStorage.setItem('bayanihan_token', token);

            return {
                success: true,
                user,
                token,
                message: 'Login successful',
            };
        } catch (error) {
            console.error('Sign in error:', error);
            return {
                success: false,
                message: 'An error occurred during login',
                errors: ['Login failed'],
            };
        }
    }

    /**
     * Sign up new user
     */
    async signUp(credentials: SignUpCredentials): Promise<AuthResponse> {
        try {
            const res = await fetch(`${API_BASE_URL}/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: credentials.name, email: credentials.email, password: credentials.password })
            });
            if (!res.ok) {
                const t = await res.text();
                return { success: false, message: t || 'Registration failed', errors: ['Registration failed'] };
            }
            const data = await res.json();
            const { user: apiUser, token } = data;
            const user = {
                id: apiUser.id,
                email: apiUser.email,
                name: apiUser.name,
                isVerified: true,
                role: 'user' as const,
                createdAt: new Date()
            };
            localStorage.setItem('bayanihan_token', token);

            return {
                success: true,
                user,
                token,
                message: 'Registration successful',
            };
        } catch (error) {
            console.error('Sign up error:', error);
            return {
                success: false,
                message: 'An error occurred during registration',
                errors: ['Registration failed'],
            };
        }
    }

    /**
     * Get current user from token
     */
    async getCurrentUser(): Promise<User | null> {
        try {
            const token = localStorage.getItem('bayanihan_token');
            if (!token) return null;
            const res = await fetch(`${API_BASE_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
            if (!res.ok) {
                localStorage.removeItem('bayanihan_token');
                return null;
            }
            const apiUser = await res.json();
            return {
                id: apiUser.id,
                email: apiUser.email,
                name: apiUser.name,
                isVerified: true,
                role: 'user' as const,
                createdAt: new Date(),
            };
        } catch (error) {
            console.error('Get current user error:', error);
            return null;
        }
    }

    /**
     * Create a test user for development
     */
    async createTestUser(): Promise<AuthResponse> {
        try {
            const testUser = {
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123'
            };

            // Check if test user already exists
            const existingUser = database.getUserByEmail(testUser.email);
            if (existingUser) {
                // Create session for existing user
                const token = uuidv4();
                const expiresAt = new Date();
                expiresAt.setDate(expiresAt.getDate() + 7);

                database.createSession(existingUser.id, token, expiresAt);
                localStorage.setItem('bayanihan_token', token);

                return {
                    success: true,
                    user: existingUser,
                    token,
                    message: 'Test user login successful',
                };
            }

            // Create new test user
            const saltRounds = 12;
            const passwordHash = await bcrypt.hash(testUser.password, saltRounds);

            const user = database.createUser({
                name: testUser.name,
                email: testUser.email,
                passwordHash,
                role: 'user'
            });

            if (!user) {
                return {
                    success: false,
                    message: 'Failed to create test user',
                    errors: ['Test user creation failed'],
                };
            }

            // Create session token
            const token = uuidv4();
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 7);

            database.createSession(user.id, token, expiresAt);
            localStorage.setItem('bayanihan_token', token);

            return {
                success: true,
                user,
                token,
                message: 'Test user created successfully',
            };
        } catch (error) {
            console.error('Create test user error:', error);
            return {
                success: false,
                message: 'An error occurred creating test user',
                errors: ['Test user creation failed'],
            };
        }
    }

    /**
     * Sign out user
     */
    async signOut(): Promise<void> {
        try {
            const token = localStorage.getItem('bayanihan_token');
        } catch (error) {
            console.error('Sign out error:', error);
        } finally {
            // Always clear local storage
            localStorage.removeItem('bayanihan_token');
        }
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated(): boolean {
        return !!localStorage.getItem('bayanihan_token');
    }

    /**
     * Get stored token
     */
    getToken(): string | null {
        return localStorage.getItem('bayanihan_token');
    }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;
