import { useState } from 'react';
import settings from '../settings';
import { authorizedFetch } from '../auth';
import { handleApiError, handleCaughtError } from './apiError';
import { toast } from '../components/ui/use-toast';

export function useCreateUser(onSuccess: () => Promise<void>) {
	const [isLoading, setIsLoading] = useState(false);

	const createUser = async (values: {
		username: string;
		password: string;
		role: string;
	}) => {
		setIsLoading(true);
		try {
			const url = `${settings.apiUrl}/dashboard/register/`;
			const response = await authorizedFetch(url, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(values),
			});

			if (!response.ok) {
				handleApiError('Error al crear Usuario', response.status);
			} else {
				toast({ title: 'Usuario creado' });
				await onSuccess();
			}
		} catch (error) {
			handleCaughtError(error, 'Error creating user');
		} finally {
			setIsLoading(false);
		}
	};

	return { createUser, isLoading };
}
