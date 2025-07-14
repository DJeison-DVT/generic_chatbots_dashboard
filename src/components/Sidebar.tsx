import { NavLink, useFetcher, useRouteLoaderData } from 'react-router-dom';
import { Gauge, ShoppingCart, Award, LogOut, Contact } from 'lucide-react';
import { Button } from './ui/button';
import React from 'react';

function AuthStatus() {
	let { user } = useRouteLoaderData('root') as { user: string | null };
	let fetcher = useFetcher();

	let isLoggingOut = fetcher.formData != null;

	return (
		<div>
			<fetcher.Form method="post" action="/logout">
				<div className="m-4 justify-between flex gap-3 items-center text-white">
					<div>{user}</div>
					<Button type="submit" disabled={isLoggingOut}>
						<LogOut />
					</Button>
				</div>
			</fetcher.Form>
		</div>
	);
}

interface NavigationTabProps {
	to: string;
	children: React.ReactNode;
	end?: boolean;
}
const NavigationTab: React.FC<NavigationTabProps> = ({
	to,
	children,
	end = false,
}) => {
	return (
		<NavLink
			to={to}
			end={end}
			className={({ isActive }) =>
				(isActive ? 'bg-black/25' : '') + ' hover:bg-black/35'
			}
		>
			<div className="flex gap-4">{children}</div>
		</NavLink>
	);
};

export default function Sidebar() {
	let { role } = useRouteLoaderData('root') as { role: string | null };

	return (
		<div className="w-fit h-full flex flex-col">
			<div className="bg-primary w-64 flex justify-center py-2 h-20">
				<img
					src="/demente-logo.png"
					alt="demente logo"
					className="invert w-60"
				/>
			</div>
			<div className="flex flex-col bg-dark flex-1">
				<nav className="flex flex-col  text-primary flex-1 *:p-4">
					{role === 'viewer' ? (
						<NavigationTab to="/dashboard" end>
							<Gauge />
							Dashboard
						</NavigationTab>
					) : (
						<>
							<NavigationTab to="/dashboard" end>
								<Gauge />
								Dashboard
							</NavigationTab>
							<NavigationTab to="/dashboard/participations">
								<ShoppingCart />
								Participaciones
							</NavigationTab>
							<NavigationTab to="/dashboard/prizes">
								<Award />
								Premios
							</NavigationTab>
							{role === 'admin' && (
								<NavigationTab to="/dashboard/users">
									<Contact />
									Usuarios
								</NavigationTab>
							)}
						</>
					)}
				</nav>
				<AuthStatus />
			</div>
		</div>
	);
}
