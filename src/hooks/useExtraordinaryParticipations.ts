import { useState } from 'react';
import settings from '../settings';
import { authorizedFetch } from '../auth';
import { handleCaughtError } from './apiError';
import { flowStore } from '../flowStore';
import { toast } from '../components/ui/use-toast';

export function useExtraordinaryParticipations() {
	const [isLoading, setIsLoading] = useState(false);

	async function register(date: string, count: number): Promise<boolean> {
		const flowName = flowStore.getSelectedFlow();
		if (!flowName) return false;

		const base = `${settings.apiUrl}/dashboard/analytics/flows/${flowName}/extraordinary-participations`;
		setIsLoading(true);
		try {
			let response = await authorizedFetch(base, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ date, count }),
			});

			if (response.status === 409) {
				response = await authorizedFetch(`${base}/${date}`, {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ count }),
				});
			}

			if (response.ok) {
				toast({ title: 'Participaciones extraordinarias registradas' });
				return true;
			} else {
				toast({ title: 'Error al registrar participaciones extraordinarias', variant: 'destructive' });
				return false;
			}
		} catch (error) {
			handleCaughtError(error, 'Error registrando participaciones extraordinarias');
			return false;
		} finally {
			setIsLoading(false);
		}
	}

	return { register, isLoading };
}
