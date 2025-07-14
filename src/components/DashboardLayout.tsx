import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function DashboardLayout() {
	return (
		<div className="flex flex-1 h-screen w-screen">
			<Sidebar />
			<div className="flex flex-1 flex-col">
				<Outlet />
			</div>
		</div>
	);
}
