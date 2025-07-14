import { useEffect, useState } from 'react';
import settings from '../../settings';
import { useToast } from '../ui/use-toast';
import { DashboardUser } from '../../Types/User';
import UserCard from './UserCard';
import { ScrollArea } from '../ui/scroll-area';
import UserCreationDialog from './UserCreationDialog';
import { authorizedFetch } from '../../auth';

export default function Users() {
	const [users, setUsers] = useState<DashboardUser[]>([]);
	const [selectedUser, setSelectedUser] = useState<DashboardUser>();
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const { toast } = useToast();

	const changeUser = (idx: number) => {
		setSelectedUser(users[idx]);
	};

	const fetchUsers = async () => {
		setIsLoading(true);
		try {
			const url = `${settings.apiUrl}/api/dashboard/users`;
			const response = await authorizedFetch(url);
			if (!response.ok) {
				toast({
					title: 'Fallo al conseguir usuarios',
					description: response.status,
				});
				return;
			}

			const data = await response.json();
			const transformedData = data.map((user: { _id: any }) => ({
				...user,
				id: user._id,
				_id: undefined,
			})) as DashboardUser[];

			const sortedUsers = transformedData.sort((a, b) => {
				// Admins first
				if (a.role === 'admin' && b.role !== 'admin') return -1;
				if (a.role !== 'admin' && b.role === 'admin') return 1;

				// If both are admins or both are non-admins, sort by username
				if (a.username < b.username) return -1;
				if (a.username > b.username) return 1;

				return 0;
			});
			setUsers(sortedUsers);
		} catch (error) {
			console.error('Error fetching users: ', error);
		}
		setIsLoading(false);
	};

	useEffect(() => {
		fetchUsers();
	}, []);
	return (
		<div className="flex flex-1 flex-col max-h-screen ">
			<div className="text-3xl h-20 flex items-center px-8">
				Usuarios Registrados
			</div>
			<div className="flex flex-1 overflow-hidden p-4">
				<div className="border-2 border-dark/40 bg-primary/90 items-center flex flex-col min-w-96 rounded-2xl">
					<div className="p-4 flex w-full">
						<UserCreationDialog
							onUserCreation={fetchUsers}
							isLoading={isLoading}
						/>
					</div>
					<ScrollArea className="w-full h-full">
						<div className="">
							{users.map((user, idx) => (
								<div
									key={user.id}
									className={`w-full hover:bg-dark/20 hover:cursor-pointer  ${selectedUser?.id == users[idx].id && 'bg-dark/10'}`}
								>
									<UserCard
										index={idx}
										user={user}
										onBodyClick={changeUser}
										onUserDeletion={fetchUsers}
									/>
								</div>
							))}
						</div>
					</ScrollArea>
				</div>
				<div className="flex flex-col flex-1 items-center "></div>
			</div>
		</div>
	);
}
