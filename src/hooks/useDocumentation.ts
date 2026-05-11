import { useState, useEffect, useCallback } from 'react';
import { DocumentationUser, DocumentationVerdict } from '../Types/Documentation';
import settings from '../settings';
import { authorizedFetch } from '../auth';
import { handleApiError, handleCaughtError } from './apiError';
import { toast } from '../components/ui/use-toast';

export function useDocumentation() {
	const [users, setUsers] = useState<DocumentationUser[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	const fetchUsers = useCallback(async () => {
		setUsers([]);
		setIsLoading(true);
		try {
			const response = await authorizedFetch(
				`${settings.apiUrl}/dashboard/documentation/`,
			);

			if (!response.ok) {
				const body = await response.json();
				handleApiError(
					body.detail?.[0]?.msg || 'Error al obtener documentación',
					response.status,
				);
				return;
			}

			const data = await response.json();
			setUsers(data as DocumentationUser[]);
		} catch (error) {
			handleCaughtError(error, 'Error fetching documentation users');
		} finally {
			setIsLoading(false);
		}
	}, []);

	const acceptDocumentation = async (userId: string) => {
		try {
			const response = await authorizedFetch(
				`${settings.apiUrl}/dashboard/documentation/${userId}/accept`,
				{ method: 'POST' },
			);

			if (!response.ok) {
				const body = await response.json();
				handleApiError(
					body.detail || 'Error al aprobar documentación',
					response.status,
				);
				return;
			}

			toast({ title: 'Documentación aprobada' });
			await fetchUsers();
		} catch (error) {
			handleCaughtError(error, 'Error accepting documentation');
		}
	};

	const rejectDocumentation = async (userId: string, verdict: DocumentationVerdict) => {
		try {
			const response = await authorizedFetch(
				`${settings.apiUrl}/dashboard/documentation/${userId}/reject`,
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(verdict),
				},
			);

			if (!response.ok) {
				const body = await response.json();
				handleApiError(
					body.detail || 'Error al rechazar documentación',
					response.status,
				);
				return;
			}

			toast({ title: 'Documentación rechazada' });
			await fetchUsers();
		} catch (error) {
			handleCaughtError(error, 'Error rejecting documentation');
		}
	};

	useEffect(() => {
		fetchUsers();
	}, [fetchUsers]);

	return { users, isLoading, fetchUsers, acceptDocumentation, rejectDocumentation };
}
