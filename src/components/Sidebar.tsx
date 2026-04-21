import { NavLink, useFetcher, useRouteLoaderData } from 'react-router-dom';
import { Gauge, ShoppingCart, LogOut, Contact, Award } from 'lucide-react';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger } from './ui/select';
import React, { useState } from 'react';
import { useFlows } from '../hooks/useFlows';
import { flowStore } from '../flowStore';

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

function FlowSelector() {
	const { flows, isLoading } = useFlows();
	const [selected, setSelected] = useState(flowStore.getSelectedFlow() ?? '');

	React.useEffect(() => {
		if (!selected && flows.length > 0) {
			const defaultFlow = flows[0].name;
			setSelected(defaultFlow);
			flowStore.setSelectedFlow(defaultFlow);
		}
	}, [flows, selected]);

	const handleChange = (value: string) => {
		setSelected(value);
		flowStore.setSelectedFlow(value);
		window.location.reload();
	};

	const displayName =
		flows.find((f) => f.name === selected)?.display_name ?? 'Flujo';

	return (
		<Select value={selected} onValueChange={handleChange} disabled={isLoading}>
			<SelectTrigger className="h-auto p-4 text-primary text-base bg-transparent border-none rounded-none hover:bg-black/35 w-full focus:ring-0 focus:ring-offset-0">
				<div className="flex gap-4 truncate">{displayName}</div>
			</SelectTrigger>
			<SelectContent>
				{flows.map((flow) => (
					<SelectItem key={flow.name} value={flow.name}>
						{flow.display_name}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}

export default function Sidebar() {
	let { role } = useRouteLoaderData('root') as { role: string | null };

	return (
		<div className="w-64 h-full flex flex-col">
			<div className="bg-primary w-64 flex justify-center py-2 h-20">
				{/* <img
					src="/demente-logo.png"
					alt="demente logo"
					className="invert w-60"
				/> */}
			</div>
			<div className="flex flex-col bg-dark flex-1">
				<FlowSelector />
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
							<NavigationTab to="/dashboard/participations?status=pending_review">
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
