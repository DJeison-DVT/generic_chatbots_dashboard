import { LoaderFunctionArgs, redirect } from 'react-router-dom';
import { jwtDecode, JwtPayload } from 'jwt-decode';
import settings from './settings';

interface CustomJwtPayload extends JwtPayload {
	sub: string;
	role: string;
}

interface AuthProvider {
	isAuthenticated: boolean;
	username: null | string;
	role: null | string;
	signin(username: string, password: string): Promise<void>;
	signout(): Promise<void>;
	loadToken(): void;
	checkTokenValidity(): boolean;
}

export const authProvider: AuthProvider = {
	isAuthenticated: false,
	username: null,
	role: null,

	async signin(username, password) {
		const response = await fetch(`${settings.apiUrl}/api/auth/token`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: new URLSearchParams({
				username,
				password,
			}),
		});

		if (!response.ok) {
			throw new Error('Invalid login attempt');
		}
		const data = await response.json();
		const token = data.access_token;
		const decodedToken = jwtDecode<CustomJwtPayload>(token);
		if (token) {
			localStorage.setItem(settings.tokenName, token);
			authProvider.isAuthenticated = true;
			authProvider.username = username;
			authProvider.role = decodedToken.role;
		}
	},
	async signout() {
		localStorage.removeItem(settings.tokenName);
		authProvider.isAuthenticated = false;
		authProvider.username = null;
		authProvider.role = null;
	},
	loadToken() {
		const token = localStorage.getItem(settings.tokenName);
		if (token && this.checkTokenValidity()) {
			const decodedToken = jwtDecode<CustomJwtPayload>(token);
			this.isAuthenticated = true;
			this.username = decodedToken.sub || null;
			this.role = decodedToken.role || null;
		}
	},
	checkTokenValidity() {
		const token = localStorage.getItem(settings.tokenName);
		if (token) {
			try {
				const decodedToken = jwtDecode<CustomJwtPayload>(token);
				const currentTime = Math.floor(Date.now() / 1000);

				if (decodedToken.exp && decodedToken.exp < currentTime) {
					this.signout();
					return false;
				}

				return true;
			} catch (error) {
				console.error('Invalid token:', error);
				this.signout();
				return false;
			}
		}

		this.signout();
		return false;
	},
};

export async function loginAction({ request }: LoaderFunctionArgs) {
	let formData = await request.formData();
	let username = formData.get('username') as string | null;
	let password = formData.get('password') as string | null;

	if (!username) {
		return {
			error: 'You must provide a username to log in',
		};
	}

	if (!password) {
		return {
			error: 'You must provide a password to log in',
		};
	}

	try {
		await authProvider.signin(username, password);
	} catch (error) {
		return {
			error: 'Invalid login attempt',
		};
	}

	let redirectTo = formData.get('redirectTo') as string | null;
	return redirect(redirectTo || '/');
}

interface FetchOptions extends RequestInit {
	headers?: Record<string, string>;
}

export async function authorizedFetch(url: string, options: FetchOptions = {}) {
	if (!authProvider.checkTokenValidity()) {
		throw new Error('Invalid token');
	}
	const token = localStorage.getItem(settings.tokenName);

	const headers = {
		...options.headers,
		Authorization: `Bearer ${token}`,
	};

	const fetchOptions: RequestInit = {
		...options,
		headers,
	};

	const response = await fetch(url, fetchOptions);
	return response;
}

authProvider.loadToken();
