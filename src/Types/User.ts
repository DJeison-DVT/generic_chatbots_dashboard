export type User = {
	id: string;
	phone: string;
	terms: boolean;
	name: string;
	email: string;
	address: string;
	complete: boolean;
	documented: boolean;
	ine_front_url: string;
	ine_back_url: string;
	proof_of_residence_url: string;
	tax_status_certificate_url: string;
};

export type DashboardUser = {
	id: string;
	username: string;
	role: string;
};
