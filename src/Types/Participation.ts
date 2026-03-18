import { User } from './User';

export type ParticipationData = {
	ticket_url: string | null;
	rejection_reason: string | null;
	ticket_attempts: number | null;
	serial_number: string | null;
	amount_total: number | null;
	cluster_id: string | null;
	document_id: string | null;
	duplicate_count: number | null;
	sha256_hash: string | null;
	store_name: string | null;
};

export type Participation = {
	id: string;
	user_id: string;
	user: User;
	created_at: Date;
	updated_at: Date;
	current_step: string;
	flow_name: string;
	status: string;
	participation_data: ParticipationData;
};

export type Status =
	| 'in_progress'
	| 'pending_review'
	| 'approved'
	| 'rejected'
	| 'completed';
