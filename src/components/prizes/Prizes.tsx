import { useEffect, useState } from 'react';
import { DataTable } from './data-table';
import { columns } from './columns';
import { PrizeInfo } from '../../Types/Prizes';
import settings from '../../settings';
import { useToast } from '../ui/use-toast';
import { authorizedFetch } from '../../auth';

export default function Participations() {
	const [prizes, setPrizes] = useState<PrizeInfo[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const { toast } = useToast();

	const fetchPrizes = async () => {
		setIsLoading(true);
		try {
			const url = `${settings.apiUrl}/api/codes/count`;
			const response = await authorizedFetch(url);

			if (!response.ok) {
				toast({
					title: 'Fallo al conseguir conteo',
					description: response.status,
				});
				return;
			}

			const data = await response.json();
			setPrizes(data);
		} catch (error) {
			console.error('Error fetching participations: ', error);
		}
		setIsLoading(false);
	};

	useEffect(() => {
		fetchPrizes();
	}, []);

	return (
		<>
			<DataTable columns={columns} data={prizes} isLoading={isLoading} />
		</>
	);
}
