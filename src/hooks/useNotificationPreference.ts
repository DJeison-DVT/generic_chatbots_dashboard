import { useState, useEffect } from 'react';
import { NotificationPreference } from '../Types/NotificationPreference';
import settings from '../settings';
import { authorizedFetch } from '../auth';
import { flowStore } from '../flowStore';
import { handleApiError, handleCaughtError } from './apiError';

export function useNotificationPreference() {
    const [preference, setPreference] = useState<NotificationPreference | null>(
        null,
    );
    const [isLoading, setIsLoading] = useState(true);
    const flowName = flowStore.getSelectedFlow();

    useEffect(() => {
        if (!flowName) {
            setIsLoading(false);
            return;
        }
        async function fetchPreference() {
            try {
                const response = await authorizedFetch(
                    `${settings.apiUrl}/dashboard/preferences/notifications/`,
                );
                if (response.ok) {
                    const data: NotificationPreference[] = await response.json();
                    setPreference(data.find(p => p.flow_name === flowName) ?? null);
                }
            } catch (error) {
                handleCaughtError(error, 'Error fetching notification preference');
            } finally {
                setIsLoading(false);
            }
        }
        fetchPreference();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const toggle = async () => {
        if (!flowName) return;
        try {
            if (!preference) {
                // No preference yet — create with default threshold of 50
                const response = await authorizedFetch(
                    `${settings.apiUrl}/dashboard/preferences/notifications/`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ flow_name: flowName, threshold: 50 }),
                    },
                );
                if (response.ok) {
                    const created: NotificationPreference = await response.json();
                    setPreference(created);
                } else {
                    handleApiError('Error al activar alerta', response.status);
                }
            } else {
                const response = await authorizedFetch(
                    `${settings.apiUrl}/dashboard/preferences/notifications/${flowName}`,
                    {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ enabled: !preference.enabled }),
                    },
                );
                if (response.ok) {
                    const updated: NotificationPreference = await response.json();
                    setPreference(updated);
                } else {
                    handleApiError('Error al actualizar alerta', response.status);
                }
            }
        } catch (error) {
            handleCaughtError(error, 'Error toggling notification');
        }
    };

    const updateThreshold = async (threshold: number) => {
        if (!flowName || !preference) return;
        try {
            const response = await authorizedFetch(
                `${settings.apiUrl}/dashboard/preferences/notifications/${flowName}`,
                {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ threshold }),
                },
            );
            if (response.ok) {
                const updated: NotificationPreference = await response.json();
                setPreference(updated);
            } else {
                handleApiError('Error al actualizar umbral', response.status);
            }
        } catch (error) {
            handleCaughtError(error, 'Error updating threshold');
        }
    };

    return { preference, isLoading, toggle, updateThreshold };
}
