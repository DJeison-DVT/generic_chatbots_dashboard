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
	const { role } = useLoaderData() as { role: string };
	return (
		<div className="flex-1 w-full flex flex-col overflow-hidden bg-background">
			<ScrollArea className="flex-1 flex flex-col p-4">
				<div className="grid grid-cols-2 gap-4 flex-1">
					<div className="grid grid-cols-3 gap-4 col-span-2">
						<ChartEmbed chartLink="https://charts.mongodb.com/charts-kleenex-promo-qiyrdzy/embed/charts?id=8b462e65-e20a-4834-9831-b6afe1cc2491&maxDataAge=14400&theme=light&autoRefresh=true" />
						<ChartEmbed chartLink="https://charts.mongodb.com/charts-kleenex-promo-qiyrdzy/embed/charts?id=a387ca72-4242-4b16-96f7-8a2566482505&maxDataAge=14400&theme=light&autoRefresh=true" />
						<ChartEmbed chartLink="https://charts.mongodb.com/charts-kleenex-promo-qiyrdzy/embed/charts?id=d585d512-8fc9-4487-a942-a3522ce3e98b&maxDataAge=14400&theme=light&autoRefresh=true" />
					</div>
					<div className="w-full h-full col-span-2">
						<ChartEmbed chartLink="https://charts.mongodb.com/charts-kleenex-promo-qiyrdzy/embed/charts?id=9d80906f-58e7-4296-a3d3-8c819988c20a&maxDataAge=14400&theme=light&autoRefresh=true" />
					</div>
					{role !== 'viewer' && (
						<>
							<ChartEmbed chartLink="https://charts.mongodb.com/charts-kleenex-promo-qiyrdzy/embed/charts?id=5c01eefe-fcc4-4b7d-b989-a79b9d3c56d9&maxDataAge=14400&theme=light&autoRefresh=true" />
							<ChartEmbed chartLink="https://charts.mongodb.com/charts-kleenex-promo-qiyrdzy/embed/charts?id=72033d90-850b-46e3-8ee6-abee47f8b559&maxDataAge=14400&theme=light&autoRefresh=true" />
						</>
					)}
				</div>
			</ScrollArea>
		</div>
	);
}
