import { useState } from 'react';
import settings from '../settings';
import { authorizedFetch } from '../auth';
import { handleApiError, handleCaughtError } from './apiError';
import { toast } from '../components/ui/use-toast';

type UpdateUserValues = {
	role?: string;
	phone?: string | null;
	password?: string;
	allowed_flows?: string[] | null;
};

export function useUpdateUser(onSuccess: () => Promise<void>) {
	const [isLoading, setIsLoading] = useState(false);

	const updateUser = async (username: string, values: UpdateUserValues) => {
		setIsLoading(true);
		try {
			const url = `${settings.apiUrl}/dashboard/users/${username}`;
			const response = await authorizedFetch(url, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(values),
			});

			if (!response.ok) {
				handleApiError('Error al actualizar usuario', response.status);
			} else {
				toast({ title: 'Usuario actualizado' });
				await onSuccess();
			}
		} catch (error) {
			handleCaughtError(error, 'Error updating user');
		} finally {
			setIsLoading(false);
		}
	};

	return { updateUser, isLoading };
}
