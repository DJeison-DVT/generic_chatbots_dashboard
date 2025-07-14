import { LoaderFunctionArgs, redirect } from 'react-router-dom';
import { authProvider } from '../auth';

function authenticatedLoader() {
	if (authProvider.isAuthenticated) {
		return redirect('/dashboard');
	}
	return null;
}

function protectedLoader({ request }: LoaderFunctionArgs) {
	if (!authProvider.isAuthenticated) {
		let params = new URLSearchParams();
		params.set('from', new URL(request.url).pathname);
		return redirect('/login?' + params.toString());
	}
	return null;
}

function adminLoader() {
	if (authProvider.isAuthenticated && authProvider.role !== 'admin')
		return redirect('/dashboard');
	return null;
}

function userOrAdminLoader() {
	if (authProvider.role !== 'user' && authProvider.role !== 'admin') {
		return redirect('/dashboard');
	}
	return null;
}

export { authenticatedLoader, protectedLoader, adminLoader, userOrAdminLoader };
