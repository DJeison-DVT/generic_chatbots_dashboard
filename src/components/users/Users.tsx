import { useState } from 'react';
import { DashboardUser } from '../../Types/User';
import UserCard from './UserCard';
import { ScrollArea } from '../ui/scroll-area';
import UserCreationDialog from './UserCreationDialog';
import UserEditDialog from './UserEditDialog';
import { useUsers } from '../../hooks/useUsers';
import { useFlows } from '../../hooks/useFlows';

export default function Users() {
    const { users, fetchUsers } = useUsers();
    const { flows } = useFlows();
    const [selectedUser, setSelectedUser] = useState<DashboardUser | undefined>();

    return (
        <div className="flex flex-1 flex-col max-h-screen">
            <div className="text-3xl h-20 flex items-center px-8">
                Usuarios Registrados
            </div>
            <div className="flex flex-1 overflow-hidden p-4">
                <div className="border-2 border-dark/40 bg-primary/90 items-center flex flex-col min-w-96 rounded-2xl">
                    <div className="p-4 flex w-full">
                        <UserCreationDialog onUserCreation={fetchUsers} />
                    </div>
                    <ScrollArea className="w-full h-full">
                        <div>
                            {users.map((user) => (
                                <div
                                    key={user.id}
                                    className={`w-full hover:bg-dark/20 hover:cursor-pointer ${
                                        selectedUser?.id === user.id ? 'bg-dark/10' : ''
                                    }`}
                                >
                                    <UserCard
                                        user={user}
                                        onClick={() => setSelectedUser(user)}
                                    />
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
                <div className="flex flex-col flex-1 items-center" />
            </div>
            {selectedUser && (
                <UserEditDialog
                    user={selectedUser}
                    flows={flows}
                    isOpen={true}
                    onClose={() => setSelectedUser(undefined)}
                    onSuccess={fetchUsers}
                />
            )}
        </div>
    );
}
