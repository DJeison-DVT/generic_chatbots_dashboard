import { useState, useEffect } from 'react';
import { DashboardUser } from '../Types/User';
import settings from '../settings';
import { authorizedFetch } from '../auth';
import { handleCaughtError } from './apiError';

export function useCurrentUser() {
    const [currentUser, setCurrentUser] = useState<DashboardUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchCurrentUser() {
            try {
                const response = await authorizedFetch(
                    `${settings.apiUrl}/dashboard/users/me/`,
                );
                if (response.ok) {
                    const data = await response.json();
                    setCurrentUser({
                        ...data,
                        id: data._id ?? data.id,
                    });
                }
            } catch (error) {
                handleCaughtError(error, 'Error fetching current user');
            } finally {
                setIsLoading(false);
            }
        }
        fetchCurrentUser();
    }, []);

    return { currentUser, isLoading };
}
