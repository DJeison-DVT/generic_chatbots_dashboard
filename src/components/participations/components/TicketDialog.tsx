// src/components/participations/components/TicketDialog.tsx
import { useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '../../ui/dialog';
import { Button } from '../../ui/button';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormMessage,
} from '../../ui/form';
import { Input } from '../../ui/input';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '../../ui/alert-dialog';
import settings from '../../../settings';
import { Participation } from '../../../Types/Participation';
import FullImage from '../../ui/full-image';
import { useTicket } from '../../../hooks/useTicket';
import { useFlows } from '../../../hooks/useFlows';

const ticketNumberSchema = z.object({
	ticketNumber: z.string(),
	amountTotal: z.string().optional(),
	productPoints: z.string().optional(),
});

interface TicketDialogProps {
	participation: Participation;
	onTicketSend: () => Promise<void>;
}

export default function TicketDialog({
	participation,
	onTicketSend,
}: TicketDialogProps) {
	const [reason, setReason] = useState<string>('');
	const [isOpen, setIsOpen] = useState(false);
	const { flows } = useFlows();

	const loteUrls = (participation.participation_data as Record<string, unknown>)
		?.lote_urls as string[] | undefined;
	const flowHasLoteUrls = flow?.data_fields?.some(
		(field) => field.name === 'lote_urls',
	);
	const hasLoteUrls = !!flowHasLoteUrls && !!loteUrls && loteUrls.length > 0;

	const flow = flows.find((f) => f.name === participation.flow_name);
	const hasAmountTotal = flow?.data_fields?.some(
		(field) => field.name === 'amount_total',
	);
	const hasProductPoints = flow?.data_fields?.some(
		(field) => field.name === 'product_points',
	);

	const form = useForm<z.infer<typeof ticketNumberSchema>>({
		resolver: zodResolver(ticketNumberSchema),
		defaultValues: {
			ticketNumber: participation.participation_data?.serial_number || '',
			amountTotal: '',
			productPoints: '',
		},
	});

	const { submitTicket, rejectTicket, disabled } = useTicket(
		participation,
		async () => {
			await onTicketSend();
			setIsOpen(false);
		},
	);

	const setFormTicketNumber = (ticketNumber: string) => {
		form.setValue('ticketNumber', ticketNumber);
	};

	const onSubmit = async (values: z.infer<typeof ticketNumberSchema>) => {
		const amountTotal =
			values.amountTotal ? parseFloat(values.amountTotal) : undefined;
		const productPoints =
			values.productPoints ? parseInt(values.productPoints, 10) : undefined;
		const success = await submitTicket(
			values.ticketNumber,
			amountTotal,
			productPoints,
		);
		if (success) form.reset();
	};

	const handleReject = async () => {
		await rejectTicket(reason);
	};

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button>Ticket</Button>
			</DialogTrigger>
			<DialogContent className="min-w-fit h-[700px] flex flex-col">
				<DialogHeader>
					<DialogTitle>Validación de Ticket</DialogTitle>
				</DialogHeader>
				<DialogDescription asChild>
					<div className="flex-1 min-h-0 overflow-y-auto">
					<div className="flex h-80">
						<div className="min-w-[500px]">
							<FullImage
								src={`${settings.bucketURL + participation.participation_data?.ticket_url}`}
								alt="ticket"
								setParentField={setFormTicketNumber}
							>
								<img
									className="max-h-[600px]"
									src={`${settings.bucketURL + participation.participation_data?.ticket_url}`}
								/>
							</FullImage>
						</div>
						<div className="grid grid-cols-2 grid-rows-2 h-fit min-w-[260px] gap-3 m-5">
							<Form {...form}>
								<form
									onSubmit={form.handleSubmit(onSubmit)}
									className="contents"
								>
									<FormField
										control={form.control}
										name="ticketNumber"
										// eslint-disable-next-line @typescript-eslint/no-explicit-any
										render={({ field }: { field: any }) => (
											<FormItem className="col-span-2 h-fit">
												<FormControl>
													<Input
														className="min-w-[250px]"
														placeholder="Num. de Ticket"
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									{hasAmountTotal && (
										<FormField
											control={form.control}
											name="amountTotal"
											// eslint-disable-next-line @typescript-eslint/no-explicit-any
											render={({ field }: { field: any }) => (
												<FormItem className="col-span-2 h-fit">
													<FormControl>
														<Input
															className="min-w-[250px]"
															placeholder="Monto total"
															type="number"
															step="0.01"
															{...field}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									)}
									{hasProductPoints && (
										<FormField
											control={form.control}
											name="productPoints"
											// eslint-disable-next-line @typescript-eslint/no-explicit-any
											render={({ field }: { field: any }) => (
												<FormItem className="col-span-2 h-fit">
													<FormControl>
														<Input
															className="min-w-[250px]"
															placeholder="Puntos de producto"
															type="number"
															step="1"
															{...field}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									)}
									<div className="flex justify-center">
										<Button
											variant="secondary"
											type="submit"
											disabled={disabled}
										>
											Aceptar
										</Button>
									</div>
								</form>
							</Form>
							{disabled ? (
								<Button
									disabled={disabled}
									variant="destructive"
									className="w-fit"
								>
									Rechazar
								</Button>
							) : (
								<AlertDialog>
									<AlertDialogTrigger asChild>
										<Button
											disabled={disabled}
											variant="destructive"
											className="w-fit"
										>
											Rechazar
										</Button>
									</AlertDialogTrigger>
									<AlertDialogContent className="w-fit">
										<AlertDialogHeader>
											<AlertDialogTitle>Motivo de Rechazo</AlertDialogTitle>
											<AlertDialogDescription asChild>
												<div className="flex flex-col gap-2">
													{[
														'No Legible',
														'Ticket invalido',
														'Folio Repetido',
														...(!hasLoteUrls
															? ['Sin fotos de lote']
															: []),
													].map((value) => (
														<label
															key={value}
															className="flex items-center gap-2 cursor-pointer"
														>
															<input
																type="radio"
																name="rejection-reason"
																value={value}
																checked={reason === value}
																onChange={() => setReason(value)}
															/>
															{value}
														</label>
													))}
												</div>
											</AlertDialogDescription>
										</AlertDialogHeader>
										<AlertDialogFooter>
											<AlertDialogCancel>Cancelar</AlertDialogCancel>
											<AlertDialogAction
												onClick={handleReject}
												disabled={disabled}
											>
												Rechazar
											</AlertDialogAction>
										</AlertDialogFooter>
									</AlertDialogContent>
								</AlertDialog>
							)}
						</div>
					</div>
					</div>
				</DialogDescription>
				{hasLoteUrls && (
					<div className="border-t pt-3 px-2 shrink">
						<p className="text-sm font-medium mb-2">Fotos de lote</p>
						<div className="flex gap-2 overflow-x-auto pb-2">
							{loteUrls.map((url, index) => (
									<div key={index} className="shrink-0">
										<FullImage
											src={`${settings.bucketURL + url}`}
											alt={`Lote ${index + 1}`}
										>
											<img
												className="h-24 w-auto rounded border cursor-pointer hover:opacity-80 transition-opacity"
												src={`${settings.bucketURL + url}`}
												alt={`Lote ${index + 1}`}
											/>
										</FullImage>
									</div>
								))}
						</div>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}
