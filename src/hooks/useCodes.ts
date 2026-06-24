import { useState, useEffect, useCallback } from 'react';
import { Code } from '../Types/Code';
import settings from '../settings';
import { authorizedFetch } from '../auth';
import { handleApiError, handleCaughtError } from './apiError';

export function useCodes(participationId: string, flowName: string, isOpen: boolean) {
	const [codes, setCodes] = useState<Code[]>([]);
	const [isLoading, setIsLoading] = useState(false);

	const fetchCodes = useCallback(async () => {
		if (codes.length !== 0) return;

		setIsLoading(true);
		try {
			const url = `${settings.apiUrl}/dashboard/codes/?participation_id=${participationId}&flow_name=${flowName}`;
			const response = await authorizedFetch(url);
			if (!response.ok) {
				handleApiError('Fallo al conseguir códigos', response.status);
				return;
			}
			const data = await response.json();
			setCodes(data.codes);
		} catch (error) {
			handleCaughtError(error, 'Error fetching codes');
		} finally {
			setIsLoading(false);
		}
	}, [codes, participationId, flowName]);

	useEffect(() => {
		if (isOpen) {
			fetchCodes();
		}
	}, [isOpen, fetchCodes]);

	return { codes, isLoading };
}
