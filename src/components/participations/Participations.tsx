// src/components/participations/Participations.tsx
import React, { useState } from 'react';
import { Participation } from '../../Types/Participation';
import { columns as originalColumns } from './columns';
import { DataTable } from './data-table';
import TicketDialog from './components/TicketDialog';
import { ColumnDef, Row } from '@tanstack/react-table';
import { toast } from '../ui/use-toast';
import { Button } from '../ui/button';
import FullImage from '../ui/full-image';
import { useSearchParams } from 'react-router-dom';
import { useParticipations } from '../../hooks/useParticipations';
import settings from '../../settings';

export default function Participations() {
	const [searchParams] = useSearchParams();
	const {
		participations,
		isLoading,
		pageCount,
		fetchParticipations,
		acceptDocuments,
		rejectDocuments,
	} = useParticipations(searchParams);

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
		...originalColumns.slice(0, 3),
		ticketColumn,
		...originalColumns.slice(3),
	];

	const [documentationChecks, setDocumentationChecks] = useState({
		ine_front: false,
		ine_back: false,
	});

	const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const { name, checked } = event.target;
		setDocumentationChecks((prevState) => ({
			...prevState,
			[name]: checked,
		}));
	};

	const handleDocumentationConfirm = async (participation: Participation) => {
		if (!documentationChecks.ine_front || !documentationChecks.ine_back) {
			toast({ title: 'Favor de confirmar todos los documentos' });
			return;
		}
		await acceptDocuments(participation);
	};

	const renderSubComponent = ({ row }: { row: Row<Participation> }) => {
		const participation = row.original;
		const user = participation.user;

		return (
			<div>
				<p>
					<strong>Nombre:</strong> {user.name}
				</p>
				<p>
					<strong>Premio:</strong>{' '}
					{!isNaN(Number(participation.prize))
						? `Cupon de ${participation.prize}`
						: participation.prize}
				</p>
				<p>
					<strong>Numero de participacion:</strong> {participation.priority_number}
				</p>
				<p>
					<strong>Email:</strong> {user.email}
				</p>
				<p>
					<strong>Fecha de nacimiento:</strong> {user.date_of_birth}
				</p>
				{user.physical_terms ? (
					<p className="text-green-500">Terminos fisicos aceptados</p>
				) : (
					<p className="text-red-500">Terminos fisicos no han sido aceptados</p>
				)}
				{user.address && (
					<p>
						<strong>Dirección:</strong> {user.address}
					</p>
				)}
				{user.documented ? (
					<p className="text-green-500">Documentado</p>
				) : (
					<p className="text-red-500">No documentado</p>
				)}
				<div className="flex p-4 gap-4">
					{user.ine_front_url && (
						<div className="flex flex-col justify-center items-center">
							<p className="text-center font-bold">INE Frontal</p>
							<FullImage
								src={settings.bucketURL + user.ine_front_url}
								alt="INE Front"
							>
								<img
									src={settings.bucketURL + user.ine_front_url}
									alt="INE Front"
									className="h-80 w-auto object-contain"
								/>
							</FullImage>
						</div>
					)}
					{user.ine_back_url && (
						<div className="flex flex-col justify-center items-center">
							<p className="text-center font-bold">INE Posterior</p>
							<FullImage
								src={settings.bucketURL + user.ine_back_url}
								alt="INE Back"
							>
								<img
									src={settings.bucketURL + user.ine_back_url}
									alt="INE Back"
									className="h-80 w-auto object-contain"
								/>
							</FullImage>
						</div>
					)}
					{user.ine_front_url && user.ine_back_url && !user.documented && (
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
										onClick={() => handleDocumentationConfirm(participation)}
										disabled={
											!documentationChecks.ine_front ||
											!documentationChecks.ine_back
										}
									>
										Confirmar
									</Button>
									<Button
										type="button"
										onClick={() => rejectDocuments(participation)}
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
