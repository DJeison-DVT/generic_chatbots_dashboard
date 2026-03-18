import { useState, useEffect } from 'react';
import { PrizeInfo } from '../Types/Prizes';
import settings from '../settings';
import { authorizedFetch } from '../auth';
import { handleApiError, handleCaughtError } from './apiError';

export function usePrizes() {
	const [prizes, setPrizes] = useState<PrizeInfo[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	const fetchPrizes = async () => {
		setIsLoading(true);
		try {
			const url = `${settings.apiUrl}/codes/count`;
			const response = await authorizedFetch(url);

			if (!response.ok) {
				handleApiError('Fallo al conseguir conteo', response.status);
				return;
			}

			const data = await response.json();
			setPrizes(data);
		} catch (error) {
			handleCaughtError(error, 'Error fetching prizes');
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchPrizes();
	}, []);

	return { prizes, isLoading };
}
