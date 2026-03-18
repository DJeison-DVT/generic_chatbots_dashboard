import { useState, useEffect, useCallback } from 'react';
import { ChatMessage } from '../Types/Message';
import settings from '../settings';
import { authorizedFetch } from '../auth';
import { handleApiError, handleCaughtError } from './apiError';

export function useMessages(userId: string, isOpen: boolean) {
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [isLoading, setIsLoading] = useState(false);

	const fetchMessages = useCallback(async () => {
		if (messages.length !== 0) return;

		setIsLoading(true);
		try {
			const url = `${settings.apiUrl}api/messages/history?id=${userId}`;
			const response = await authorizedFetch(url);
			if (!response.ok) {
				handleApiError('Fallo al conseguir mensajes', response.status);
				return;
			}
			const data = await response.json();
			setMessages(data.reverse());
		} catch (error) {
			handleCaughtError(error, 'Error fetching messages');
		} finally {
			setIsLoading(false);
		}
	}, [messages, userId]);

	useEffect(() => {
		if (isOpen) {
			fetchMessages();
		}
	}, [isOpen, fetchMessages]);

	return { messages, isLoading, fetchMessages };
}
