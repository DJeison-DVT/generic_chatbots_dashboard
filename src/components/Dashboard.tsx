import { ScrollArea } from './ui/scroll-area';
// import { useLoaderData } from 'react-router-dom';

interface ChartEmbedProps {
	chartLink: string;
}

const ChartEmbed: React.FC<ChartEmbedProps> = ({ chartLink }) => {
	return (
		<iframe
			style={{
				background: '#FFFFFF',
				border: 'none',
				borderRadius: '2px',
				boxShadow: '0 2px 10px 0 rgba(70, 76, 79, .2)',
			}}
			className="h-[540px] w-full"
			src={chartLink}
			title="MongoDB Atlas Chart"
		/>
	);
};

export default function Dashboard() {
	// const { role } = useLoaderData() as { role: string };
	return (
		<div className="flex-1 w-full flex flex-col overflow-hidden bg-background">
			<ScrollArea className="flex-1 flex flex-col p-4">
				<div className="grid grid-cols-2 gap-4 flex-1">
					<div className="grid grid-cols-3 gap-4 col-span-2">
						<ChartEmbed chartLink="https://charts.mongodb.com/charts-kleenex-promo-qiyrdzy/embed/charts?id=3ee178d3-611d-481e-9606-6e154f87caca&maxDataAge=3600&theme=light&autoRefresh=true" />
						<ChartEmbed chartLink="https://charts.mongodb.com/charts-kleenex-promo-qiyrdzy/embed/charts?id=8ab6b725-03fc-4691-a4a0-e8526945cc2e&maxDataAge=3600&theme=light&autoRefresh=true" />
						<ChartEmbed chartLink="https://charts.mongodb.com/charts-kleenex-promo-qiyrdzy/embed/charts?id=3e8bca96-27a7-4ff4-89f3-9bb20c0c3dd9&maxDataAge=3600&theme=light&autoRefresh=true" />
					</div>
					<div className="w-full h-full col-span-2">
						<ChartEmbed chartLink="https://charts.mongodb.com/charts-kleenex-promo-qiyrdzy/embed/charts?id=8baad83c-bf4e-4ec2-b852-239160d030b8&maxDataAge=3600&theme=light&autoRefresh=true" />
					</div>
					{/* {role !== 'viewer' && (
						<>
							<ChartEmbed chartLink="https://charts.mongodb.com/charts-kleenex-promo-qiyrdzy/embed/charts?id=5c01eefe-fcc4-4b7d-b989-a79b9d3c56d9&maxDataAge=14400&theme=light&autoRefresh=true" />
							<ChartEmbed chartLink="https://charts.mongodb.com/charts-kleenex-promo-qiyrdzy/embed/charts?id=72033d90-850b-46e3-8ee6-abee47f8b559&maxDataAge=14400&theme=light&autoRefresh=true" />
						</>
					)} */}
				</div>
			</ScrollArea>
		</div>
	);
}
