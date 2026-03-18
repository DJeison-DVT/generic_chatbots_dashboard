import { useState, useEffect } from 'react';
import { DashboardUser } from '../Types/User';
import settings from '../settings';
import { authorizedFetch } from '../auth';
import { handleApiError, handleCaughtError } from './apiError';

export function useUsers() {
	const [users, setUsers] = useState<DashboardUser[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	const fetchUsers = async () => {
		setIsLoading(true);
		try {
			const url = `${settings.apiUrl}/api/dashboard/users`;
			const response = await authorizedFetch(url);
			if (!response.ok) {
				handleApiError('Fallo al conseguir usuarios', response.status);
				return;
			}

			const data = await response.json();
			const transformedData = data.map((user: { _id: string }) => ({
				...user,
				id: user._id,
				_id: undefined,
			})) as DashboardUser[];

			const sortedUsers = transformedData.sort((a, b) => {
				if (a.role === 'admin' && b.role !== 'admin') return -1;
				if (a.role !== 'admin' && b.role === 'admin') return 1;
				if (a.username < b.username) return -1;
				if (a.username > b.username) return 1;
				return 0;
			});

			setUsers(sortedUsers);
		} catch (error) {
			handleCaughtError(error, 'Error fetching users');
		}
		setIsLoading(false);
	};

	useEffect(() => {
		fetchUsers();
	}, []);

	return { users, isLoading, fetchUsers };
}
