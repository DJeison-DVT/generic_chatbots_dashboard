// src/hooks/useParticipations.ts
import { useState, useEffect, useCallback } from 'react';
import { Participation, ParticipationData } from '../Types/Participation';
import settings from '../settings';
import { authorizedFetch } from '../auth';
import { handleApiError, handleCaughtError } from './apiError';
import { toast } from '../components/ui/use-toast';

const PAGE_SIZE = 10;

interface RawParticipationItem {
	id: string;
	user_id: string;
	created_at: string;
	updated_at: string;
	current_step: string | null;
	flow_name: string;
	status: string;
	participation_data: Record<string, unknown> | null;
	user: {
		id: string;
		number: string;
		provider: string;
		chatbot_flow: string;
		user_display_name: string | null;
		chatbot_data: Record<string, unknown> | null;
	};
}

export function useParticipations(searchParams: URLSearchParams) {
	const [participations, setParticipations] = useState<Participation[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [pageCount, setPageCount] = useState(0);

	const fetchParticipations = useCallback(async () => {
		setParticipations([]);
		setIsLoading(true);
		try {
			const params = searchParams.toString();
			if (!params) {
				return;
			}

			const urlParams = new URLSearchParams(params);
			const adjustedParams = new URLSearchParams();
			urlParams.forEach((value, key) => {
				if (key === 'status' || key === 'prize_type') {
					value
						.split(',')
						.filter((v) => v.trim())
						.forEach((v) => adjustedParams.append(key, v.trim()));
				} else {
					adjustedParams.set(key, value);
				}
			});

			const response = await authorizedFetch(
				`${settings.apiUrl}/dashboard/participations/?limit=${PAGE_SIZE}&ordering=-created_at&${adjustedParams.toString()}`,
			);

			if (response.status === 404) {
				return;
			}

			const data = await response.json();
			setPageCount(Math.ceil(data.count / PAGE_SIZE));

			const transformedData = data.participations.map(
				(item: RawParticipationItem): Participation => ({
					id: item.id,
					user_id: item.user_id,
					user: {
						id: item.user.id,
						phone: item.user.number,
						provider: item.user.provider,
						chatbot_flow: item.user.chatbot_flow,
						name: item.user.user_display_name ?? '',
						chatbot_data: item.user.chatbot_data,
					},
					created_at: new Date(item.created_at),
					updated_at: new Date(item.updated_at),
					current_step: item.current_step,
					flow_name: item.flow_name,
					status: item.status,
					participation_data: item.participation_data as ParticipationData,
				}),
			);

			setParticipations(transformedData);
		} catch (error) {
			handleCaughtError(error, 'Error fetching participations');
		} finally {
			setIsLoading(false);
		}
	}, [searchParams]);

	const acceptDocuments = async (participation: Participation) => {
		try {
			const url = `${settings.apiUrl}/api/dashboard/accept-documents/`;
			const response = await authorizedFetch(url, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ ticket_id: participation.id }),
			});
			if (!response.ok) {
				const body = await response.json();
				handleApiError(
					body.detail || 'Error al aceptar ticket',
					response.status,
				);
			} else {
				toast({ title: 'Ticket aceptado' });
				await fetchParticipations();
			}
		} catch (error) {
			handleCaughtError(error, 'Error aceptando la documentacion');
		}
	};

	const rejectDocuments = async (participation: Participation) => {
		try {
			const url = `${settings.apiUrl}/api/dashboard/reject-documents/`;
			const response = await authorizedFetch(url, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ ticket_id: participation.id }),
			});
			if (!response.ok) {
				const body = await response.json();
				handleApiError(
					body.detail || 'Error al rechazar ticket',
					response.status,
				);
			} else {
				toast({ title: 'Ticket rechazado' });
				await fetchParticipations();
			}
		} catch (error) {
			handleCaughtError(error, 'Error rechazando la documentacion');
		}
	};

	useEffect(() => {
		fetchParticipations();
	}, [fetchParticipations]);

	return {
		participations,
		isLoading,
		pageCount,
		fetchParticipations,
		acceptDocuments,
		rejectDocuments,
	};
}
