// src/hooks/useTicket.ts
import { useState } from 'react';
import { Participation, Status } from '../Types/Participation';
import settings from '../settings';
import { authorizedFetch } from '../auth';
import { handleApiError, handleCaughtError } from './apiError';
import { toast } from '../components/ui/use-toast';

export function useTicket(
	participation: Participation,
	onRefresh: () => Promise<void>,
) {
	const [disabled, setDisabled] = useState(
		participation.status !== Status.PendingReview,
	);

	const rejectTicket = async (reason: string) => {
		setDisabled(true);
		try {
			const url = `${settings.apiUrl}/dashboard/participations/${participation.id}/reject-participation`;
			const response = await authorizedFetch(url, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					rejection_reason: reason,
				}),
			});
			if (!response.ok) {
				const body = await response.json();
				handleApiError(
					body.detail?.[0]?.msg || 'Error al rechazar ticket',
					response.status,
				);
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

	const submitTicket = async (
		ticketNumber: string,
		amountTotal?: number,
	): Promise<boolean> => {
		setDisabled(true);
		try {
			const url = `${settings.apiUrl}/dashboard/participations/${participation.id}/accept-participation`;
			const body: Record<string, unknown> = {
				serial_number: ticketNumber,
			};
			if (amountTotal != null) {
				body.amount_total = amountTotal;
			}
			const response = await authorizedFetch(url, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body),
			});
			if (!response.ok) {
				// Serial number '{}' already used in participation {}
				if (
					response.status === 409 &&
					(await response.text()).includes('already used in participation')
				) {
					toast({ title: 'Folio repetido', variant: 'destructive' });
					return false;
				}
				const body = await response.json();
				handleApiError(
					body.detail?.[0]?.msg || 'Error al aceptar ticket',
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
