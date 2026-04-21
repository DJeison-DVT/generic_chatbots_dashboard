import { useState } from 'react';
import settings from '../settings';
import { authorizedFetch } from '../auth';
import { handleApiError, handleCaughtError } from './apiError';

export function useDeleteUser(onSuccess: () => Promise<void>) {
	const [isLoading, setIsLoading] = useState(false);

	const deleteUser = async (userId: string) => {
		setIsLoading(true);
		try {
			const url = `${settings.apiUrl}/dashboard/users`;
			const response = await authorizedFetch(url, {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ user_id: userId }),
			});

			if (!response.ok) {
				handleApiError('Error al eliminar el usuario', response.status);
			} else {
				await onSuccess();
			}
		} catch (error) {
			handleCaughtError(error, 'Error deleting user');
		} finally {
			setIsLoading(false);
		}
	};

	return { deleteUser, isLoading };
}
