import { useEffect, useState } from 'react';

import { User } from '../../Types/User';
import { Participation } from '../../Types/Participation';
import { columns as originalColumns } from './columns';
import { DataTable } from './data-table';
import settings from '../../settings';
import TicketDialog from './components/TicketDialog';
import { ColumnDef, Row } from '@tanstack/react-table';
import { authorizedFetch } from '../../auth';
import { toast } from '../ui/use-toast';
import { Button } from '../ui/button';
import FullImage from '../ui/full-image';

export default function Participations() {
	const [participations, setParticipations] = useState<Participation[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(true);

	const fetchParticipations = async () => {
		setIsLoading(true);
		try {
			const response = await authorizedFetch(
				settings.apiUrl + settings.participationsURL,
			);
			const data = await response.json();

			const transformedData = data.map((item: any) => {
				const participationId = item._id;
				const userId = item.user._id;

				let userObject: User = {
					id: userId,
					phone: item.user.phone,
					terms: item.user.terms,
					name: item.user.name,
					email: item.user.email,
					address: item.user.physical_address || '',
					complete: item.user.complete,
					documented: item.user.documentation_validated,
					ine_front_url: item.user.ine_front_url || '',
					ine_back_url: item.user.ine_back_url || '',
					proof_of_residence_url: item.user.proof_of_residence_url || '',
					tax_status_certificate_url: item.user.tax_status_certificate_url || '',
				};

				const result: Participation = {
					id: participationId,
					user: userObject,
					ticketUrl: item.ticket_url,
					ticketAttempts: item.ticket_attempts,
					datetime: new Date(item.datetime + 'Z'),
					priorityNumber: String(item.priority_number),
					status: item.status,
					flow: item.flow,
					prize: item.prize,
					prize_type: item.prize_type,
					serial_number: item.serial_number,
				};

				return result;
			});

			setParticipations(transformedData);
		} catch (error) {
			console.error('Error fetching participations: ', error);
		}
		setIsLoading(false);
	};

	const ticketColumn: ColumnDef<Participation> = {
		header: 'Ticket',
		accessorKey: 'id',
		cell: ({ row }) => {
			const participation = row.original;
			return participation.ticketUrl ? (
				<TicketDialog
					participation={participation}
					onTicketSend={fetchParticipations}
				/>
			) : null;
		},
	};

	const columns = [
		...originalColumns.slice(0, 3), // Get the first 4 columns
		ticketColumn, // Insert the new column
		...originalColumns.slice(3), // Append the rest of the columns
	];

	const [documentationChecks, setDocumentationChecks] = useState({
		ine_front: false,
		ine_back: false,
		proof_of_residence: false,
	});

	const handleCheckboxChange = (event: any) => {
		const { name, checked } = event.target;
		setDocumentationChecks((prevState) => ({
			...prevState,
			[name]: checked,
		}));
	};


	const onDocumentationConfirm = async (participation: Participation) => {
		if (!documentationChecks.ine_front || !documentationChecks.ine_back || !documentationChecks.proof_of_residence) {
			toast({
				title: 'Favor de confirmar todos los documentos',
			});
			return;
		}

		try {
			const url = `${settings.apiUrl}api/dashboard/accept-documents`;
			const response = await authorizedFetch(url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					ticket_id: participation.id,
				}),
			});
			if (!response.ok) {
				const body = await response.json();
				toast({
					title: body.detail || 'Error al aceptar ticket',
					description: response.status,
				});
			} else {
				toast({
					title: 'Ticket aceptado',
				});
				await fetchParticipations();
			}
		} catch (error) {
			console.error('Error aceptando la documentacion: ', error);
		}
	}

	const onDocumentationReject = async (participation: Participation) => {
		try {
			const url = `${settings.apiUrl}api/dashboard/reject-documents`;
			const response = await authorizedFetch(url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					ticket_id: participation.id,
				}),
			});
			if (!response.ok) {
				const body = await response.json();
				toast({
					title: body.detail || 'Error al rechazar ticket',
					description: response.status,
				});
			} else {
				toast({
					title: 'Ticket rechazado',
				});
				await fetchParticipations();
			}
		} catch (error) {
			console.error('Error rechazando la documentacion: ', error);
		}
	}

	useEffect(() => {
		fetchParticipations();
	}, []);

	const renderSubComponent = ({ row }: { row: Row<Participation> }) => {
		const participation = row.original
		const user = participation.user;

		const name = user.name;
		const email = user.email;
		const address = user.address;
		const prize = participation.prize;
		const priorityNumber = participation.priorityNumber;

		const ine_front_url = user.ine_front_url;
		const ine_back_url = user.ine_back_url;
		const proof_of_residence_url = user.proof_of_residence_url;
		const tax_status_certificate_url = user.tax_status_certificate_url;
		const documented = user.documented;

		return (
			<div>
				<p>
					<strong>Nombre:</strong> {name}
				</p>
				<p>

					<strong>Premio:</strong> {!isNaN(Number(prize)) ? `Cupon de ${prize}` : prize}
				</p>
				<p>
					<strong>Numero de participacion:</strong> {priorityNumber}
				</p>
				<p>
					<strong>Email:</strong> {email}
				</p>
				{address && (
					<p>
						<strong>Dirección:</strong> {address}
					</p>
				)}
				{tax_status_certificate_url && (
					<div>
						<strong>Constancia de situación fiscal:</strong>{' '}
						<a
							href={settings.bucketURL + tax_status_certificate_url}
							target='_blank'
							rel='noreferrer'
							className='bg-gray-400 p-1 rounded-md'
						>
							Ver
						</a>
					</div>
				)}
				{documented ? (
					<p className='text-green-500'>Documentado</p>
				) : (
					<p className='text-red-500'>No documentado</p>
				)}
				<div className='flex p-4 gap-4'>
					{ine_front_url && (
						<div className='flex flex-col justify-center items-center'>
							<p className='text-center font-bold'>INE Frontal</p>
							<FullImage src={settings.bucketURL + ine_front_url} alt='INE Front'>
								<img
									src={settings.bucketURL + ine_front_url}
									alt='INE Front'
									className='h-80 w-auto object-contain'
								/>
							</FullImage>
						</div>
					)}
					{ine_back_url && (
						<div className='flex flex-col justify-center items-center'>
							<p className='text-center font-bold'>INE Posterior</p>
							<FullImage src={settings.bucketURL + ine_back_url} alt='INE Back'>
								<img
									src={settings.bucketURL + ine_back_url}
									alt='INE Back'
									className='h-80 w-auto object-contain'
								/>
							</FullImage>
						</div>
					)}
					{proof_of_residence_url && (
						<div className='flex flex-col justify-center items-center'>
							<p className='text-center font-bold'>Comprobante de domicilio</p>
							<FullImage src={settings.bucketURL + proof_of_residence_url} alt='Proof of residence'>
								<img
									src={settings.bucketURL + proof_of_residence_url}
									alt='Proof of residence'
									className='h-80 w-auto object-contain'
								/>
							</FullImage>
						</div>
					)}
					{ine_front_url && ine_back_url && proof_of_residence_url && !documented && (
						<div>
							<form className='flex flex-col gap-2'>
								<div>
									Confirmar documentacion:
								</div>
								<div className='flex-col flex [&>div]:flex [&>div]:gap-2 '>
									<div>
										<input
											type="checkbox"
											name="ine_front"
											checked={documentationChecks.ine_front}
											onChange={handleCheckboxChange}
										/>
										<label htmlFor="ine_front">He revisado el INE frontal.</label>
									</div>
									<div>
										<input
											type="checkbox"
											name="ine_back"
											checked={documentationChecks.ine_back}
											onChange={handleCheckboxChange}
										/>
										<label htmlFor="ine_back">He revisado el INE posterior.</label>
									</div>
									<div>
										<input
											type="checkbox"
											name="proof_of_residence"
											checked={documentationChecks.proof_of_residence}
											onChange={handleCheckboxChange}
										/>

										<label htmlFor="proof_of_residence">He revisado el comprobante de domicilio.</label>
									</div>
								</div>
								<div className='flex gap-2'>

									<Button
										type="button"
										onClick={() => onDocumentationConfirm(participation)}
										disabled={
											!documentationChecks.ine_front ||
											!documentationChecks.ine_back ||
											!documentationChecks.proof_of_residence
										}
									>
										Confirmar
									</Button>
									<Button type="button" onClick={() => onDocumentationReject(participation)}
										variant='destructive'
									>
										Rechazar
									</Button>
								</div>
							</form>
						</div>
					)}
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
				onRefresh={fetchParticipations}
				getRowCanExpand={() => true}
				renderSubComponent={renderSubComponent}
			/>
		</>
	);
}
