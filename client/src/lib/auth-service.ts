const API_BASE = 'http://localhost:8081/api/auth';

export interface AuthResponse {
    token?: string;
    message?: string;
    error?: string;
    userSub?: string;
    role?: string;
    success?: boolean;
}

export const authService = {
    async signUp(email: string, password: string): Promise<AuthResponse> {
        try {
            const response = await fetch(`${API_BASE}/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            return await response.json();
        } catch (error) {
            return { error: 'Network error. Please try again.' };
        }
    },

    async signIn(email: string, password: string): Promise<AuthResponse> {
        try {
            console.log('Attempting sign in for:', email);

            const response = await fetch(`${API_BASE}/signin`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            console.log('Response status:', response.status);

            const data = await response.json();
            console.log('Response data:', data);

            if (response.ok && data.token) {
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('userRole', data.role || 'CUSTOMER');
                return { token: data.token, role: data.role };
            } else {
                return { error: data.message || data.error || 'Sign in failed' };
            }
        } catch (error) {
            console.error('Network error:', error);
            return { error: 'Network error. Please try again.' };
        }
    },

    async confirmSignUp(email: string, confirmationCode: string): Promise<AuthResponse> {
        try {
            const response = await fetch(`${API_BASE}/confirm`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, confirmationCode })
            });
            return await response.json();
        } catch (error) {
            return { error: 'Network error. Please try again.' };
        }
    },

    async resendCode(email: string): Promise<AuthResponse> {
        try {
            const response = await fetch(`${API_BASE}/resend-code`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            return await response.json();
        } catch (error) {
            return { error: 'Network error. Please try again.' };
        }
    },

    getToken() {
        return typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    },

    getRole() {
        return typeof window !== 'undefined' ? localStorage.getItem('userRole') : null;
    },

    isAdmin() {
        return this.getRole() === 'ADMIN';
    },

    isAuthenticated() {
        return !!this.getToken();
    },

    logout() {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('authToken');
            localStorage.removeItem('userRole');
        }
    },

    async getCurrentUser() {
        const token = this.getToken();
        if (!token) return null;

        try {
            const response = await fetch(`${API_BASE}/me`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.ok) {
                return await response.json();
            }
            return null;
        } catch (error) {
            console.error('Get user error:', error);
            return null;
        }
    },

    redirectToHostedUI() {
        const cognitoDomain = 'https://your-domain.auth.us-east-2.amazoncognito.com';
        const clientId = '5n1mqaf2n0errdd535n2495l2b';
        const redirectUri = encodeURIComponent('http://localhost:3000/auth/callback');

        window.location.href = `${cognitoDomain}/login?client_id=${clientId}&response_type=code&scope=email+openid+profile&redirect_uri=${redirectUri}`;
    }
};
