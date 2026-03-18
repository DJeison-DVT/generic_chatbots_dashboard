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
import { useState } from 'react';
import { useCreateUser } from '../../hooks/useCreateUser';

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
}

export default function UserCreationDialog({
	onUserCreation,
}: UserCreationDialogProps) {
	const [isOpen, setIsOpen] = useState(false);

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			username: '',
			password: '',
			role: 'user',
		},
	});

	const { createUser, isLoading } = useCreateUser(async () => {
		setIsOpen(false);
		await onUserCreation();
		form.reset();
	});

	async function onSubmit(values: z.infer<typeof formSchema>) {
		await createUser(values);
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
