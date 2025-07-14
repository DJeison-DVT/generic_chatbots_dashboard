export type ChatMessage = {
	message_sid: string;
	from_: string;
	to: string;
	datetime: string;
	text: string | null;
	photo_url: string | null;
};
