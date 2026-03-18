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
import { useDeleteUser } from '../../hooks/useDeleteUser';

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
	const { deleteUser, isLoading } = useDeleteUser(async () => {
		await onUserDeletion();
		setIsOpen(false);
	});

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
							<AlertDialogAction
								onClick={() => deleteUser(user.id)}
								disabled={isLoading}
							>
								Continuar
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</div>
		</div>
	);
}
