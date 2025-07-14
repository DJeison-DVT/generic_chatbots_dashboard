import { CircleX } from 'lucide-react';
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
} from '../ui/alert-dialog';

import { DashboardUser } from '../../Types/User';
import { useState } from 'react';
import settings from '../../settings';
import { useToast } from '../ui/use-toast';
import { authorizedFetch } from '../../auth';

interface UserCard {
	index: number;
	user: DashboardUser;
	onBodyClick: (idx: number) => void;
	onUserDeletion: () => Promise<void>;
}

export default function UserCard({
	index,
	user,
	onBodyClick,
	onUserDeletion,
}: UserCard) {
	const [isOpen, setIsOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const { toast } = useToast();
	const handleDelete = async () => {
		setIsLoading(true);
		try {
			const url = `${settings.apiUrl}/api/dashboard/users`;
			const response = await authorizedFetch(url, {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					user_id: user.id,
				}),
			});

			if (!response.ok) {
				toast({
					title: 'Error al eliminar el usuario',
					description: response.status,
				});
			} else {
				await onUserDeletion();
				setIsOpen(false);
			}
		} catch (e) {
			console.error(e);
		}
		setIsLoading(false);
	};
	return (
		<div className="flex w-full justify-between items-center">
			<div className="px-8 py-4 flex-1" onClick={() => onBodyClick(index)}>
				<div className="text-lg">{user.username}</div>
				<div className="text-slate-500 text-sm">{user.role}</div>
			</div>
			<div className="flex justify-between items-center p-4 z-10">
				<AlertDialog open={isOpen} onOpenChange={setIsOpen}>
					<AlertDialogTrigger>
						<CircleX className="" />
					</AlertDialogTrigger>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>Seguro?</AlertDialogTitle>
							<AlertDialogDescription>
								Esta accion no se puede regresar
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel>Cancelar</AlertDialogCancel>
							<AlertDialogAction onClick={handleDelete} disabled={isLoading}>
								Continuar
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</div>
		</div>
	);
}
