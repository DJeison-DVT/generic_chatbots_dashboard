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
	status: Status;
	participation_data: ParticipationData;
};

export enum Status {
	InProgress = 'in_progress',
	PendingReview = 'pending_review',
	Approved = 'approved',
	Rejected = 'rejected',
	Completed = 'completed',
}

export const StatusDisplayOptions: Record<Status, string> = {
	in_progress: 'En progreso',
	pending_review: 'Pendiente de revisión',
	approved: 'Aprobado',
	rejected: 'Rechazado',
	completed: 'Completado',
};

export type PrizeType = 'physical' | 'code';

export const PrizeTypeDisplayOptions: Record<PrizeType, string> = {
	physical: 'Físico',
	code: 'Código digital',
};
