// src/components/participations/Participations.tsx
import { Participation } from '../../Types/Participation';
import { columns as originalColumns } from './columns';
import { DataTable } from './data-table';
import TicketDialog from './components/TicketDialog';
import { ColumnDef, Row } from '@tanstack/react-table';
import FullImage from '../ui/full-image';
import { useSearchParams } from 'react-router-dom';
import { useParticipations } from '../../hooks/useParticipations';
import settings from '../../settings';

export default function Participations() {
	const [searchParams] = useSearchParams();
	const { participations, isLoading, pageCount, fetchParticipations } =
		useParticipations(searchParams);

	const ticketColumn: ColumnDef<Participation> = {
		header: 'Ticket',
		accessorKey: 'id',
		cell: ({ row }) => {
			const participation = row.original;
			return participation.participation_data?.ticket_url ? (
				<TicketDialog
					participation={participation}
					onTicketSend={fetchParticipations}
				/>
			) : null;
		},
	};

	const columns = [
		...originalColumns.slice(0, 3),
		ticketColumn,
		...originalColumns.slice(3),
	];

	const CHATBOT_DATA_WHITELIST: Record<string, string> = {
		email: 'Email',
		date_of_birth: 'Fecha de nacimiento',
		address: 'Dirección',
		name: 'Nombre',
	};

	const PARTICIPATION_DATA_WHITELIST: Record<string, string> = {
		amount_total: 'Monto total',
		serial_number: 'Numero de serie',
	};

	const IMAGE_WHITELIST: Record<string, string> = {
		ine_front_url: 'INE Frontal',
		ine_back_url: 'INE Posterior',
		proof_of_address_url: 'Comprobante de Domicilio',
	};

	const renderSubComponent = ({ row }: { row: Row<Participation> }) => {
		const participation = row.original;
		const user = participation.user;
		const username =
			(user.chatbot_data?.full_name as string) ||
			user.name ||
			'Cliente sin nombre';
		const chatbotData = user.chatbot_data ?? {};
		const participationData: Record<string, unknown> =
			participation.participation_data ?? {};

		return (
			<div>
				<p>
					<strong>Nombre:</strong> {username}
				</p>
				{Object.entries(CHATBOT_DATA_WHITELIST).map(([key, label]) => {
					const value = chatbotData[key];
					if (value == null || value === '') return null;
					return (
						<p key={key}>
							<strong>{label}:</strong> {String(value)}
						</p>
					);
				})}
				{Object.entries(PARTICIPATION_DATA_WHITELIST).map(([key, label]) => {
					const value = participationData[key];
					if (value == null || value === '') return null;
					return (
						<p key={key}>
							<strong>{label}:</strong> {String(value)}
						</p>
					);
				})}
				<div className="flex p-4 gap-4">
					{Object.entries(IMAGE_WHITELIST).map(([key, label]) => {
						const url = chatbotData[key];
						if (!url) return null;
						return (
							<div
								key={key}
								className="flex flex-col justify-center items-center"
							>
								<p className="text-center font-bold">{label}</p>
								<FullImage src={settings.bucketURL + url} alt={label}>
									<img
										src={settings.bucketURL + url}
										alt={label}
										className="h-80 w-auto object-contain"
									/>
								</FullImage>
							</div>
						);
					})}
				</div>
			</div>
		);
	};

	return (
		<>
			<DataTable
				columns={columns}
				data={participations}
				isLoading={isLoading}
				getRowCanExpand={() => true}
				pageCount={pageCount}
				renderSubComponent={renderSubComponent}
			/>
		</>
	);
}
