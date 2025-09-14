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
import { useSearchParams } from 'react-router-dom';

export default function Participations() {
	const [participations, setParticipations] = useState<Participation[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [searchParams] = useSearchParams();
	const pageSize = 10;
	const [pageCount, setPageCount] = useState(0);

	const fetchParticipations = async () => {
		setParticipations([]);
		setIsLoading(true);
		try {
			const params = searchParams.toString();
			if (!params) {
				setIsLoading(false);
				return;
			}

			const adjustedParams = (() => {
				const urlParams = new URLSearchParams(params);
				const newParams = new URLSearchParams();

				// Copy all parameters first
				urlParams.forEach((value, key) => {
					// Handle array parameters that might be comma-separated
					if (key === 'status' || key === 'prize_type') {
						// Split comma-separated values and add as multiple params
						const values = value.split(',').filter((v) => v.trim());
						values.forEach((v) => {
							if (v.trim()) {
								newParams.append(key, v.trim());
							}
						});
					} else {
						// Keep other parameters as-is
						newParams.set(key, value);
					}
				});

				return newParams.toString();
			})();

			const response = await authorizedFetch(
				settings.apiUrl +
					settings.participationsURL +
					'?limit=' +
					pageSize +
					'&' +
					adjustedParams,
			);

			// Handle 404 specifically - no participations found
			if (response.status === 404) {
				setIsLoading(false);
				return;
			}

			const data = await response.json();
			const participationsData = data.participations;
			setPageCount(Math.ceil(data.count / pageSize));

			const transformedData = participationsData.map((item: any) => {
				const participationId = item._id;
				const userId = item.user._id;

				let userObject: User = {
					id: userId,
					phone: item.user.phone,
					terms: item.user.terms,
					name: item.user.name,
					email: item.user.email,
					address: item.user.address || '',
					complete: item.user.complete,
					documented: item.user.documentation_validated,
					ine_front_url: item.user.ine_front_url || '',
					ine_back_url: item.user.ine_back_url || '',
					physical_terms: item.user.physical_terms || false,
					date_of_birth: item.user.date_of_birth || '',
				};

				const result: Participation = {
					id: participationId,
					user: userObject,
					ticketUrl: item.ticket_url,
					ticketAttempts: item.ticket_attempts,
					datetime: new Date(item.datetime + 'Z'),
					priority_number: String(item.priority_number),
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

	useEffect(() => {
		fetchParticipations();
	}, [searchParams]);

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
	});

	const handleCheckboxChange = (event: any) => {
		const { name, checked } = event.target;
		setDocumentationChecks((prevState) => ({
			...prevState,
			[name]: checked,
		}));
	};

	const onDocumentationConfirm = async (participation: Participation) => {
		if (!documentationChecks.ine_front || !documentationChecks.ine_back) {
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
	};

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
	};

	const renderSubComponent = ({ row }: { row: Row<Participation> }) => {
		const participation = row.original;
		const user = participation.user;

		const name = user.name;
		const email = user.email;
		const address = user.address;
		const prize = participation.prize;
		const priority_number = participation.priority_number;

		const ine_front_url = user.ine_front_url;
		const ine_back_url = user.ine_back_url;
		const physical_terms = user.physical_terms;
		const date_of_birth = user.date_of_birth;
		const documented = user.documented;

		return (
			<div>
				<p>
					<strong>Nombre:</strong> {name}
				</p>
				<p>
					<strong>Premio:</strong>{' '}
					{!isNaN(Number(prize)) ? `Cupon de ${prize}` : prize}
				</p>
				<p>
					<strong>Numero de participacion:</strong> {priority_number}
				</p>
				<p>
					<strong>Email:</strong> {email}
				</p>
				<p>
					<strong>Fecha de nacimiento:</strong> {date_of_birth}
				</p>
				{physical_terms ? (
					<p className="text-green-500">Terminos fisicos aceptados</p>
				) : (
					<p className="text-red-500">Terminos fisicos no han sido aceptados</p>
				)}
				{address && (
					<p>
						<strong>Dirección:</strong> {address}
					</p>
				)}
				{documented ? (
					<p className="text-green-500">Documentado</p>
				) : (
					<p className="text-red-500">No documentado</p>
				)}
				<div className="flex p-4 gap-4">
					{ine_front_url && (
						<div className="flex flex-col justify-center items-center">
							<p className="text-center font-bold">INE Frontal</p>
							<FullImage
								src={settings.bucketURL + ine_front_url}
								alt="INE Front"
							>
								<img
									src={settings.bucketURL + ine_front_url}
									alt="INE Front"
									className="h-80 w-auto object-contain"
								/>
							</FullImage>
						</div>
					)}
					{ine_back_url && (
						<div className="flex flex-col justify-center items-center">
							<p className="text-center font-bold">INE Posterior</p>
							<FullImage src={settings.bucketURL + ine_back_url} alt="INE Back">
								<img
									src={settings.bucketURL + ine_back_url}
									alt="INE Back"
									className="h-80 w-auto object-contain"
								/>
							</FullImage>
						</div>
					)}
					{ine_front_url && ine_back_url && !documented && (
						<div>
							<form className="flex flex-col gap-2">
								<div>Confirmar documentacion:</div>
								<div className="flex-col flex [&>div]:flex [&>div]:gap-2 ">
									<div>
										<input
											type="checkbox"
											name="ine_front"
											checked={documentationChecks.ine_front}
											onChange={handleCheckboxChange}
										/>
										<label htmlFor="ine_front">
											He revisado el INE frontal.
										</label>
									</div>
									<div>
										<input
											type="checkbox"
											name="ine_back"
											checked={documentationChecks.ine_back}
											onChange={handleCheckboxChange}
										/>
										<label htmlFor="ine_back">
											He revisado el INE posterior.
										</label>
									</div>
								</div>
								<div className="flex gap-2">
									<Button
										type="button"
										onClick={() => onDocumentationConfirm(participation)}
										disabled={
											!documentationChecks.ine_front ||
											!documentationChecks.ine_back
										}
									>
										Confirmar
									</Button>
									<Button
										type="button"
										onClick={() => onDocumentationReject(participation)}
										variant="destructive"
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
				getRowCanExpand={() => true}
				pageCount={pageCount}
				renderSubComponent={renderSubComponent}
			/>
		</>
	);
}
