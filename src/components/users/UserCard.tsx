import { DashboardUser } from '../../Types/User';

const roleLabel: Record<string, string> = {
    admin: 'Administrador',
    validator: 'Validador',
    report: 'Reporte',
};

const roleBadge: Record<string, string> = {
    admin: 'bg-dark text-primary',
    validator: 'bg-blue-600 text-white',
    report: 'bg-slate-400 text-white',
};

interface UserCardProps {
    user: DashboardUser;
    onClick: () => void;
}

export default function UserCard({ user, onClick }: UserCardProps) {
    const initials = user.username.slice(0, 2).toUpperCase();
    const badge = roleBadge[user.role] ?? 'bg-slate-300 text-white';
    const label = roleLabel[user.role] ?? user.role;

    return (
        <div
            className="flex items-center gap-3 px-4 py-3 cursor-pointer w-full"
            onClick={onClick}
        >
            <div className="w-9 h-9 rounded-full bg-dark/15 flex items-center justify-center text-sm font-semibold text-dark shrink-0">
                {initials}
            </div>
            <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{user.username}</div>
                {user.phone && (
                    <div className="text-xs text-slate-400 truncate">{user.phone}</div>
                )}
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${badge}`}>
                {label}
            </span>
        </div>
    );
}
