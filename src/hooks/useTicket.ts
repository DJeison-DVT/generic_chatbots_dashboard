// src/hooks/useTicket.ts
import { useState } from 'react';
import { Participation } from '../Types/Participation';
import settings from '../settings';
import { authorizedFetch } from '../auth';
import { handleApiError, handleCaughtError } from './apiError';
import { toast } from '../components/ui/use-toast';

export function useTicket(
	participation: Participation,
	onRefresh: () => Promise<void>,
) {
	const [disabled, setDisabled] = useState(
		participation.participation_data.serial_number !== null,
	);

	const rejectTicket = async (reason: string) => {
		setDisabled(true);
		try {
			const url = `${settings.apiUrl}/api/dashboard/reject`;
			const response = await authorizedFetch(url, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					ticket_id: participation.id,
					rejection_reason: reason,
				}),
			});
			if (!response.ok) {
				handleApiError('Error al rechazar ticket', response.status);
			} else {
				toast({ title: 'Ticket rechazado' });
				await onRefresh();
			}
		} catch (error) {
			handleCaughtError(error, 'Error rejecting ticket');
		} finally {
			setDisabled(false);
		}
	};

	const submitTicket = async (ticketNumber: string): Promise<boolean> => {
		setDisabled(true);
		try {
			const url = `${settings.apiUrl}/api/dashboard/accept`;
			const response = await authorizedFetch(url, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					ticket_id: participation.id,
					serial_number: ticketNumber,
				}),
			});
			if (!response.ok) {
				if (response.status === 409) {
					// Delegate to rejectTicket; it manages disabled state; return before trailing setDisabled(false)
					await rejectTicket('Folio Repetido');
					return false;
				}
				const body = await response.json();
				handleApiError(
					body.detail || 'Error al aceptar ticket',
					response.status,
				);
			} else {
				toast({ title: 'Ticket aceptado' });
				await onRefresh();
				setDisabled(false);
				return true;
			}
		} catch (error) {
			handleCaughtError(error, 'Error accepting ticket');
		}
		setDisabled(false);
		return false;
	};

	return { submitTicket, rejectTicket, disabled };
}
