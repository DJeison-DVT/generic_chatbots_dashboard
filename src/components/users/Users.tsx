import { useState } from 'react';
import { DashboardUser } from '../../Types/User';
import UserCard from './UserCard';
import { ScrollArea } from '../ui/scroll-area';
import UserCreationDialog from './UserCreationDialog';
import UserEditPanel from './UserEditPanel';
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
            <div className="flex flex-1 overflow-hidden px-4 pb-4 gap-4">
                {/* Left: user list */}
                <div className="flex flex-col w-96 shrink-0 border-2 border-dark/20 rounded-2xl bg-white/60 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-dark/10">
                        <span className="text-sm font-medium text-slate-500">
                            {users.length} usuario{users.length !== 1 ? 's' : ''}
                        </span>
                        <UserCreationDialog onUserCreation={fetchUsers} />
                    </div>
                    <ScrollArea className="flex-1">
                        {users.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-slate-400 text-sm">
                                No hay usuarios registrados
                            </div>
                        ) : (
                            <div className="divide-y divide-dark/10">
                                {users.map((user) => (
                                    <div
                                        key={user.id}
                                        className={`transition-colors hover:bg-dark/5 ${
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
                        )}
                    </ScrollArea>
                </div>

                {/* Right: edit panel */}
                {selectedUser ? (
                    <div className="flex-1 border-2 border-dark/20 rounded-2xl bg-white/60 overflow-hidden">
                        <UserEditPanel
                            user={selectedUser}
                            flows={flows}
                            onClose={() => setSelectedUser(undefined)}
                            onSuccess={fetchUsers}
                        />
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-slate-400 text-sm border-2 border-dark/10 border-dashed rounded-2xl">
                        Selecciona un usuario para editar
                    </div>
                )}
            </div>
        </div>
    );
}
