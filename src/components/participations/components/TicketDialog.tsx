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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '../../ui/select';
import settings from '../../../settings';
import { Participation } from '../../../Types/Participation';
import FullImage from '../../ui/full-image';
import { useTicket } from '../../../hooks/useTicket';

const ticketNumberSchema = z.object({
	ticketNumber: z.string(),
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

	const form = useForm<z.infer<typeof ticketNumberSchema>>({
		resolver: zodResolver(ticketNumberSchema),
		defaultValues: {
			// ticketNumber: participation.serial_number || '',
			ticketNumber: participation.participation_data.serial_number || '',
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
		const success = await submitTicket(values.ticketNumber);
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
					<div className="flex h-80">
						<div className="min-w-[500px]">
							<FullImage
								src={`${settings.bucketURL + participation.participation_data.ticket_url}`}
								alt="ticket"
								setParentField={setFormTicketNumber}
							>
								<img
									className="max-h-[600px]"
									src={`${settings.bucketURL + participation.participation_data.ticket_url}`}
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
											<AlertDialogDescription>
												<Select onValueChange={setReason} defaultValue={reason}>
													<SelectTrigger className="w-[180px]">
														<SelectValue placeholder="Motivo" />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="No Legible">
															No Legible
														</SelectItem>
														<SelectItem value="Ticket invalido">
															Ticket invalido
														</SelectItem>
													</SelectContent>
												</Select>
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
				</DialogDescription>
			</DialogContent>
		</Dialog>
	);
}
