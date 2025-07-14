import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { LoaderCircle } from 'lucide-react';

import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from '../../ui/sheet';
import { useToast } from '../../ui/use-toast';
import { Participation } from '../../../Types/Participation';
import {
	MainContainer,
	ChatContainer,
	MessageList,
	Message,
	ConversationHeader,
} from '@chatscope/chat-ui-kit-react';
import { authorizedFetch } from '../../../auth';
import settings from '../../../settings';
import { useEffect, useState } from 'react';
import { ChatMessage } from '../../../Types/Message';

interface MessageHistoryProps {
	participation: Participation;
}

export default function MessageHistory({ participation }: MessageHistoryProps) {
	const phone = participation.user.phone;

	const [isOpen, setIsOpen] = useState(false);
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const { toast } = useToast();

	const fetchMessages = async () => {
		if (messages.length != 0) return;

		setIsLoading(true);
		try {
			const url = `${settings.apiUrl}api/messages/history?id=${participation.user.id}`;
			const response = await authorizedFetch(url);
			if (!response.ok) {
				toast({
					title: 'Fallo al conseguir usuarios',
					description: response.status,
				});
				return;
			}

			const data = await response.json();
			setMessages(data.reverse());
		} catch (error) {
			console.error('Error fetching users: ', error);
		}
		setIsLoading(false);
	};

	useEffect(() => {
		if (isOpen) {
			fetchMessages();
		}
	}, [isOpen]);

	return (
		<Sheet open={isOpen} onOpenChange={setIsOpen}>
			<SheetTrigger>
				<div className="text-blue-600">{phone.slice(-10)}</div>
			</SheetTrigger>
			<SheetContent className="flex flex-col bg-dark text-white flex-1 h-full">
				<SheetHeader className="flex-0 flex flex-col">
					<SheetTitle className="text-white text-2xl ">
						Historial de conversacion
					</SheetTitle>
				</SheetHeader>
				<div style={{ position: 'relative' }} className="h-[95%]">
					{isLoading ? (
						<div className="w-full flex justify-center h-full items-center">
							<LoaderCircle className="animate-spin" />
						</div>
					) : (
						<MainContainer>
							<ChatContainer>
								<ConversationHeader>
									<ConversationHeader.Content
										userName={participation.user.name}
									/>
								</ConversationHeader>

								<MessageList>
									{messages.map((message, index) => (
										<Message
											key={index}
											model={{
												message: message.text || '',
												sentTime: new Date(message.datetime).toLocaleString(),
												sender:
													message.from_ === participation.user.phone
														? participation.user.phone
														: 'system',
												direction:
													message.from_ === participation.user.phone
														? 'incoming'
														: 'outgoing',
												position: 'single',
											}}
										>
											<Message.Header
												sender={
													message.from_ === participation.user.phone
														? participation.user.name
														: ''
												}
												sentTime={new Date(message.datetime).toLocaleString()}
											/>
											{message.photo_url && (
												<Message.ImageContent
													src={message.photo_url}
													alt="Akane avatar"
													height={200}
												/>
											)}
										</Message>
									))}
								</MessageList>
							</ChatContainer>
						</MainContainer>
					)}
				</div>
			</SheetContent>
		</Sheet>
	);
}
