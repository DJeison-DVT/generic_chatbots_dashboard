import { ScrollArea } from './ui/scroll-area';
import { useLoaderData } from 'react-router-dom';

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
	const { role } = useLoaderData() as { role: string }
	return (
		<div className="flex-1 w-full flex flex-col overflow-hidden bg-background">
			<ScrollArea className="flex-1 flex flex-col p-4">
				<div className="grid grid-cols-2 gap-4 flex-1">
					<div className="grid grid-cols-3 gap-4 col-span-2">
						<ChartEmbed chartLink="https://charts.mongodb.com/charts-kleenex-promo-qiyrdzy/embed/charts?id=c3bafcbb-16d9-4553-ad73-e18a822cdaf1&maxDataAge=3600&theme=light&autoRefresh=true" />
						<ChartEmbed chartLink="https://charts.mongodb.com/charts-kleenex-promo-qiyrdzy/embed/charts?id=2e6a63f7-d44b-4730-bc9c-294a8aff54fb&maxDataAge=3600&theme=light&autoRefresh=true" />
						<ChartEmbed chartLink="https://charts.mongodb.com/charts-kleenex-promo-qiyrdzy/embed/charts?id=3854df79-bb6d-4463-9574-31cd4c36c82b&maxDataAge=3600&theme=light&autoRefresh=true" />
					</div>
					<div className="w-full h-full col-span-2">
						<ChartEmbed chartLink="https://charts.mongodb.com/charts-kleenex-promo-qiyrdzy/embed/charts?id=688c94da-c1c8-4703-9a79-a87db99ab7de&maxDataAge=3600&theme=light&autoRefresh=true" />
					</div>
					{role !== 'viewer' && (
						<>
							<ChartEmbed chartLink="https://charts.mongodb.com/charts-kleenex-promo-qiyrdzy/embed/charts?id=66165a33-cc90-4436-8118-8f7fed09cbfb&maxDataAge=3600&theme=light&autoRefresh=true" />
							<ChartEmbed chartLink="https://charts.mongodb.com/charts-kleenex-promo-qiyrdzy/embed/charts?id=d611c9d9-3cd2-4af5-b925-b4be9a62b9cf&maxDataAge=3600&theme=light&autoRefresh=true" />
						</>
					)}
				</div>
			</ScrollArea>
		</div>
	);
}
