// src/hooks/useParticipations.ts
import { useState, useEffect, useCallback } from 'react';
import { Participation } from '../Types/Participation';
import { User } from '../Types/User';
import settings from '../settings';
import { authorizedFetch } from '../auth';
import { handleApiError, handleCaughtError } from './apiError';
import { toast } from '../components/ui/use-toast';

const PAGE_SIZE = 10;

interface RawParticipationItem {
	_id: string;
	ticket_url: string;
	ticket_attempts: number;
	datetime: string;
	priority_number: number | string;
	status: string;
	flow: string;
	prize: string;
	prize_type: string;
	serial_number: string;
	user: {
		_id: string;
		phone: string;
		terms: boolean;
		name: string;
		email: string;
		address?: string;
		complete: boolean;
		documentation_validated: boolean;
		ine_front_url?: string;
		ine_back_url?: string;
		physical_terms?: boolean;
		date_of_birth?: string;
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
				`${settings.apiUrl}${settings.participationsURL}?limit=${PAGE_SIZE}&${adjustedParams.toString()}`,
			);

			if (response.status === 404) {
				return;
			}

			const data = await response.json();
			setPageCount(Math.ceil(data.count / PAGE_SIZE));

			const transformedData = data.participations.map((item: RawParticipationItem) => {
				const userObject: User = {
					id: item.user._id,
					phone: item.user.phone,
					terms: item.user.terms,
					name: item.user.name,
					email: item.user.email,
					address: item.user.address || '',
					complete: item.user.complete,
					documented: item.user.documentation_validated,
					ine_front_url: item.user.ine_front_url || '',
					ine_back_url: item.user.ine_back_url || '',
					physical_terms: item.user.physical_terms || false,
					date_of_birth: item.user.date_of_birth || '',
				};

				const result: Participation = {
					id: item._id,
					user: userObject,
					ticketUrl: item.ticket_url,
					ticketAttempts: item.ticket_attempts,
					datetime: new Date(item.datetime + 'Z'),
					priority_number: String(item.priority_number),
					status: item.status,
					flow: item.flow,
					prize: item.prize,
					prize_type: item.prize_type,
					serial_number: item.serial_number,
				};

				return result;
			});

			setParticipations(transformedData);
		} catch (error) {
			handleCaughtError(error, 'Error fetching participations');
		} finally {
			setIsLoading(false);
		}
	}, [searchParams]);

	const acceptDocuments = async (participation: Participation) => {
		try {
			const url = `${settings.apiUrl}api/dashboard/accept-documents`;
			const response = await authorizedFetch(url, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ ticket_id: participation.id }),
			});
			if (!response.ok) {
				const body = await response.json();
				handleApiError(body.detail || 'Error al aceptar ticket', response.status);
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
			const url = `${settings.apiUrl}api/dashboard/reject-documents`;
			const response = await authorizedFetch(url, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ ticket_id: participation.id }),
			});
			if (!response.ok) {
				const body = await response.json();
				handleApiError(body.detail || 'Error al rechazar ticket', response.status);
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
