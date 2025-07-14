export type User = {
	id: string;
	phone: string;
	terms: boolean;
	physical_terms: boolean;
	name: string;
	email: string;
	address: string;
	date_of_birth: string;
	complete: boolean;
	documented: boolean;
	ine_front_url: string;
	ine_back_url: string;
};

export type DashboardUser = {
	id: string;
	username: string;
	role: string;
};
