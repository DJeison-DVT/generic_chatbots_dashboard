import { z } from 'zod';
import { Button } from '../ui/button';
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '../ui/dialog';
import { Input } from '../ui/input';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '../ui/form';
import { ToggleGroup, ToggleGroupItem } from '../ui/toggle-group';
import { CirclePlus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import settings from '../../settings';
import { useToast } from '../ui/use-toast';
import { useState } from 'react';
import { authorizedFetch } from '../../auth';

const formSchema = z.object({
	username: z.string().min(2, {
		message: 'Nombre de usuario debe de ser mayor a 2 caracteres.',
	}),
	password: z.string().min(6, {
		message: 'Mayor a 6 caracteres.',
	}),
	role: z.string().min(1),
});

interface UserCreationDialogProps {
	onUserCreation: () => Promise<void>;
	isLoading: boolean;
}

export default function UserCreationDialog({
	onUserCreation,
	isLoading,
}: UserCreationDialogProps) {
	const [isOpen, setIsOpen] = useState(false);
	const { toast } = useToast();

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			username: '',
			password: '',
			role: 'user',
		},
	});

	async function onSubmit(values: z.infer<typeof formSchema>) {
		try {
			const url = `${settings.apiUrl}/api/auth/register`;
			const response = await authorizedFetch(url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(values),
			});
			if (!response.ok) {
				toast({
					title: 'Error al crear Usuario',
					description: response.status,
				});
			} else {
				toast({
					title: 'Usuario creado',
				});
				setIsOpen(false);
				await onUserCreation();
				form.reset();
			}
		} catch (error) {
			console.error('Error creating user:', error);
		}
	}

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<CirclePlus className="text-dark hover:cursor-pointer" />
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Crear nuevo Usuario</DialogTitle>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="username"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Nombre de usuario</FormLabel>
									<FormControl>
										<Input placeholder="verificador2" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="password"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Contraseña</FormLabel>
									<FormControl>
										<Input placeholder="********" type="password" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="role"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Rol seleccionado</FormLabel>

									<div className="flex">
										<ToggleGroup
											type="single"
											variant="outline"
											onValueChange={field.onChange}
										>
											<ToggleGroupItem value="admin">
												Administrador
											</ToggleGroupItem>
											<ToggleGroupItem value="user">
												Verificador
											</ToggleGroupItem>
											<ToggleGroupItem value="viewer">
												Visualizador
											</ToggleGroupItem>
										</ToggleGroup>
									</div>
									<FormMessage />
								</FormItem>
							)}
						/>
						<DialogFooter>
							<Button type="submit" disabled={isLoading}>
								Generar Usuario
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
