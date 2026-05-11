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

export type UserDisplay = {
	id: string;
	number: string;
	provider: string;
	chatbot_flow: string;
	user_display_name: string | null;
	chatbot_data: Record<string, unknown> | null;
};
