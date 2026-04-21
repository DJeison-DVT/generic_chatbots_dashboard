import { useState, useEffect } from 'react';
import { Flow } from '../Types/Flow';
import settings from '../settings';
import { authorizedFetch } from '../auth';
import { handleCaughtError } from './apiError';

export function useFlows() {
	const [flows, setFlows] = useState<Flow[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		async function fetchFlows() {
			try {
				const response = await authorizedFetch(
					`${settings.apiUrl}/dashboard/flows`,
				);
				if (response.ok) {
					const data = await response.json();
					setFlows(data);
				}
			} catch (error) {
				handleCaughtError(error, 'Error fetching flows');
			} finally {
				setIsLoading(false);
			}
		}
		fetchFlows();
	}, []);

	return { flows, isLoading };
}
