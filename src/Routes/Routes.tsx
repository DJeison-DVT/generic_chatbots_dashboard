import { createBrowserRouter, redirect } from 'react-router-dom';
import { authProvider, loginAction } from '../auth';
import { authenticatedLoader, protectedLoader, adminLoader, userOrAdminLoader } from './Loaders';
import Dashboard from '../components/Dashboard';
import Login from '../components/Login';
import Layout from '../components/Layout';
import DashboardLayout from '../components/DashboardLayout';
import Participations from '../components/participations/Participations';
import Prizes from '../components/prizes/Prizes';
import Users from '../components/users/Users';

const router = createBrowserRouter([
	{
		id: 'root',
		path: '/',
		loader() {
			return { user: authProvider.username, role: authProvider.role };
		},
		element: <Layout />,
		children: [
			{
				index: true,
				action: loginAction,
				loader: authenticatedLoader,
				element: <Login />,
			},
			{
				path: 'login',
				action: loginAction,
				loader: authenticatedLoader,
				element: <Login />,
			},
			{
				path: 'dashboard',
				loader: protectedLoader,
				element: <DashboardLayout />,
				children: [
					{
						index: true,
						element: <Dashboard />,
						loader() {
							return { role: authProvider.role };
						}
					},
					{
						path: 'participations',
						element: <Participations />,
						loader: userOrAdminLoader,
					},
					{
						path: 'prizes',
						element: <Prizes />,
						loader: userOrAdminLoader,
					},
					{
						path: 'users',
						element: <Users />,
						loader: adminLoader,
					},
				],
			},
		],
	},
	{
		path: '/logout',
		async action() {
			await authProvider.signout();
			return redirect('/');
		},
	},
]);

export default router;
