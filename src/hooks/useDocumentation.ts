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
			setUsers(
				(data as DocumentationUser[]).filter((u) => u.chatbot_data != null),
			);
		} catch (error) {
			handleCaughtError(error, 'Error fetching documentation users');
		} finally {
			setIsLoading(false);
		}
	}, []);

	const acceptDocumentation = async (userId: string) => {
		const response = await authorizedFetch(
			`${settings.apiUrl}/dashboard/documentation/${userId}/accept`,
			{ method: 'POST' },
		);

		if (!response.ok) {
			const body = await response.json();
			handleApiError(
				body.detail?.[0]?.msg || body.detail || 'Error al aprobar documentación',
				response.status,
			);
			throw new Error('Accept failed');
		}

		toast({ title: 'Documentación aprobada' });
		await fetchUsers();
	};

	const rejectDocumentation = async (userId: string, verdict: DocumentationVerdict) => {
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
				body.detail?.[0]?.msg || body.detail || 'Error al rechazar documentación',
				response.status,
			);
			throw new Error('Reject failed');
		}

		toast({ title: 'Documentación rechazada' });
		await fetchUsers();
	};

	useEffect(() => {
		fetchUsers();
	}, [fetchUsers]);

	return { users, isLoading, fetchUsers, acceptDocumentation, rejectDocumentation };
}
