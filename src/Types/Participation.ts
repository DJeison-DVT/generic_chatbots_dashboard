import { User } from './User';

export type Participation = {
	id: string;
	user: User;
	ticketUrl: string;
	ticketAttempts: number;
	priority_number: string;
	datetime: Date;
	status: string;
	flow: string;
	prize: string;
	prize_type: string;
	serial_number: string;
};

export type Status =
	| 'complete'
	| 'pending'
	| 'incomplete'
	| 'rejected'
	| 'approved'
	| 'fullfiled'
	| 'documents';
