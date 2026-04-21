import { useAnalytics } from '../hooks/useAnalytics';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Status, StatusDisplayOptions } from '../Types/Participation';

const STATUS_COLORS = [
	'hsl(222, 47%, 11%)',
	'hsl(215, 20%, 65%)',
	'hsl(210, 40%, 80%)',
	'hsl(0, 84%, 60%)',
	'hsl(210, 40%, 96%)',
	'hsl(217, 33%, 17%)',
	'hsl(200, 15%, 46%)',
	'hsl(220, 14%, 30%)',
];

function StatCard({
	label,
	value,
	loading,
}: {
	label: string;
	value: number;
	loading: boolean;
}) {
	return (
		<div className="rounded-lg border border-border bg-card p-6">
			<p className="text-sm text-muted-foreground">{label}</p>
			<p className="mt-2 text-3xl font-semibold tracking-tight">
				{loading ? (
					<span className="inline-block h-8 w-20 animate-pulse rounded bg-muted" />
				) : (
					value.toLocaleString()
				)}
			</p>
		</div>
	);
}

function StatusPieChart({
	data,
	loading,
}: {
	data: { status: string; count: number }[];
	loading: boolean;
}) {
	if (loading) {
		return (
			<div className="flex h-full items-center justify-center">
				<div className="h-48 w-48 animate-pulse rounded-full bg-muted" />
			</div>
		);
	}

	if (data.length === 0) {
		return (
			<div className="flex h-full items-center justify-center text-sm text-muted-foreground">
				Sin datos
			</div>
		);
	}

	const total = data.reduce((sum, d) => sum + d.count, 0);
	const displayData = data.map((d) => ({
		...d,
		label:
			StatusDisplayOptions[d.status.toLowerCase() as Status] ?? d.status,
	}));

	return (
		<div className="flex h-full flex-col items-center gap-6 lg:flex-row lg:items-start">
			<div className="h-64 w-64 flex-shrink-0">
				<ResponsiveContainer width="100%" height="100%">
					<PieChart>
						<Pie
							data={displayData}
							dataKey="count"
							nameKey="label"
							cx="50%"
							cy="50%"
							innerRadius={60}
							outerRadius={100}
							paddingAngle={2}
							strokeWidth={0}
						>
							{data.map((_, i) => (
								<Cell
									key={i}
									fill={STATUS_COLORS[i % STATUS_COLORS.length]}
								/>
							))}
						</Pie>
						<Tooltip
							content={({ payload }) => {
								if (!payload?.length) return null;
								const item = payload[0];
								return (
									<div className="rounded-md border border-border bg-card px-3 py-2 text-sm shadow-sm">
										<span className="font-medium">{item.name}</span>
										<span className="ml-2 text-muted-foreground">
											{item.value}
										</span>
									</div>
								);
							}}
						/>
					</PieChart>
				</ResponsiveContainer>
			</div>
			<div className="flex flex-wrap gap-x-6 gap-y-2 text-sm lg:flex-col lg:pt-6">
				{displayData.map((d, i) => {
					const pct = total > 0 ? ((d.count / total) * 100).toFixed(1) : '0';
					return (
						<div key={d.status} className="flex items-center gap-2">
							<span
								className="inline-block h-3 w-3 rounded-full"
								style={{
									backgroundColor:
										STATUS_COLORS[i % STATUS_COLORS.length],
								}}
							/>
							<span className="text-foreground">{d.label}</span>
							<span className="text-muted-foreground">
								{pct}%
							</span>
						</div>
					);
				})}
			</div>
		</div>
	);
}

export default function Dashboard() {
	const {
		totalParticipations,
		uniqueUsers,
		totalPrizes,
		statusBreakdown,
		isLoading,
	} = useAnalytics();

	return (
		<div className="flex-1 w-full overflow-auto bg-background p-6">
			<div className="mx-auto max-w-5xl space-y-6">
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
					<StatCard
						label="Total participaciones"
						value={totalParticipations}
						loading={isLoading}
					/>
					<StatCard
						label="Usuarios únicos"
						value={uniqueUsers}
						loading={isLoading}
					/>
					<StatCard
						label="Premios asignados"
						value={totalPrizes}
						loading={isLoading}
					/>
				</div>

				<div className="rounded-lg border border-border bg-card p-6">
					<h2 className="mb-4 text-sm font-medium text-muted-foreground">
						Estado de participaciones
					</h2>
					<StatusPieChart data={statusBreakdown} loading={isLoading} />
				</div>
			</div>
		</div>
	);
}
