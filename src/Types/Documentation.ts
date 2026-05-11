import { UserDisplay } from './User';

export type DocumentationChatbotData = {
	documentation_status: string;
	ine_front_url?: string;
	ine_back_url?: string;
	proof_of_address_url?: string;
};

export type DocumentationUser = UserDisplay & {
	chatbot_data: DocumentationChatbotData;
};

export type DocumentationVerdict = {
	ine_front: boolean;
	ine_back: boolean;
	proof_of_address: boolean;
};
