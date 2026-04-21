import { useState, useEffect } from 'react';
import settings from '../settings';
import { authorizedFetch } from '../auth';
import { handleCaughtError } from './apiError';
import { flowStore } from '../flowStore';

interface ParticipationsSummary {
	total: number;
	by_status: Record<string, number>;
	by_prize_type: Record<string, number>;
}

interface ConversationsSummary {
	total_messages: number;
	by_direction: Record<string, number>;
	unique_users: number;
}

interface StatusCount {
	status: string;
	count: number;
}

export interface DailyCount {
	date: string;
	count: number;
}

export interface AnalyticsData {
	totalParticipations: number;
	uniqueUsers: number;
	totalPrizes: number;
	statusBreakdown: StatusCount[];
	dailyCounters: DailyCount[];
	isLoading: boolean;
}

export function useAnalytics(): AnalyticsData {
	const [totalParticipations, setTotalParticipations] = useState(0);
	const [uniqueUsers, setUniqueUsers] = useState(0);
	const [totalPrizes, setTotalPrizes] = useState(0);
	const [statusBreakdown, setStatusBreakdown] = useState<StatusCount[]>([]);
	const [dailyCounters, setDailyCounters] = useState<DailyCount[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		async function fetchAnalytics() {
			const flowName = flowStore.getSelectedFlow();
			if (!flowName) return;

			const base = `${settings.apiUrl}/dashboard/analytics/flows/${flowName}`;

			try {
				const [partRes, convRes, statusRes, dailyRes] = await Promise.all([
					authorizedFetch(`${base}/participations/summary`),
					authorizedFetch(`${base}/conversations/summary`),
					authorizedFetch(`${base}/participations/by-status`),
					authorizedFetch(`${base}/participations/daily-counters`),
				]);

				if (partRes.ok) {
					const data: ParticipationsSummary = await partRes.json();
					setTotalParticipations(data.total);
					const prizes = Object.values(data.by_prize_type).reduce(
						(sum, v) => sum + v,
						0,
					);
					setTotalPrizes(prizes);
				}

				if (convRes.ok) {
					const data: ConversationsSummary = await convRes.json();
					setUniqueUsers(data.unique_users);
				}

				if (statusRes.ok) {
					const data: StatusCount[] = await statusRes.json();
					setStatusBreakdown(data);
				}

				if (dailyRes.ok) {
					const data: DailyCount[] = await dailyRes.json();
					setDailyCounters(data);
				}
			} catch (error) {
				handleCaughtError(error, 'Error fetching analytics');
			} finally {
				setIsLoading(false);
			}
		}

		fetchAnalytics();
	}, []);

	return { totalParticipations, uniqueUsers, totalPrizes, statusBreakdown, dailyCounters, isLoading };
}
