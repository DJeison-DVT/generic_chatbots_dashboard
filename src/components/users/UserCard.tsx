import { DashboardUser } from '../../Types/User';

interface UserCardProps {
    user: DashboardUser;
    onClick: () => void;
}

export default function UserCard({ user, onClick }: UserCardProps) {
    return (
        <div
            className="px-8 py-4 flex-1 w-full cursor-pointer"
            onClick={onClick}
        >
            <div className="text-lg">{user.username}</div>
            <div className="text-slate-500 text-sm">{user.role}</div>
        </div>
    );
}
