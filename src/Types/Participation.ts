import { User } from './User';

export type ParticipationData =
	| ({
			ticket_url: string | null;
			serial_number: string | null;
	  } & Record<string, unknown>)
	| null;

export type Participation = {
	id: string;
	user_id: string;
	user: User;
	created_at: Date;
	updated_at: Date;
	current_step: string | null;
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
