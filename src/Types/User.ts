export type User = {
	id: string;
	phone: string;
	provider: string;
	chatbot_flow: string;
	name: string;
	chatbot_data: Record<string, unknown> | null;
};

export type DashboardUser = {
	id: string;
	username: string;
	role: string;
};
