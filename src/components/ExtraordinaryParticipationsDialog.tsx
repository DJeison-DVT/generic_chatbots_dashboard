import { z } from 'zod';
import { Button } from './ui/button';
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from './ui/dialog';
import { Input } from './ui/input';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from './ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useExtraordinaryParticipations } from '../hooks/useExtraordinaryParticipations';

const formSchema = z.object({
	count: z.coerce.number().int().min(0, 'No puede ser negativo'),
});

interface Props {
	date: string;
	isOpen: boolean;
	onClose: () => void;
	onSuccess: () => void;
}

export default function ExtraordinaryParticipationsDialog({ date, isOpen, onClose, onSuccess }: Props) {
	const { register, isLoading } = useExtraordinaryParticipations();

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: { count: '' as unknown as number },
	});

	const formattedDate = new Date(date + 'T00:00:00').toLocaleDateString('es', {
		day: '2-digit',
		month: 'long',
		year: 'numeric',
	});

	async function onSubmit(values: z.infer<typeof formSchema>) {
		const success = await register(date, values.count);
		if (success) {
			form.reset();
			onSuccess();
		}
	}

	function handleOpenChange(open: boolean) {
		if (!open) {
			form.reset();
			onClose();
		}
	}

	return (
		<Dialog open={isOpen} onOpenChange={handleOpenChange}>
			<DialogContent className="sm:max-w-[380px]">
				<DialogHeader>
					<DialogTitle>Participaciones extraordinarias</DialogTitle>
					<p className="text-sm text-muted-foreground">{formattedDate}</p>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="count"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Cantidad</FormLabel>
									<FormControl>
										<Input type="number" min={0} placeholder="0" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<DialogFooter>
							<Button type="submit" disabled={isLoading}>
								Guardar
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
