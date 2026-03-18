import { DataTable } from './data-table';
import { columns } from './columns';
import { usePrizes } from '../../hooks/usePrizes';

export default function Prizes() {
	const { prizes, isLoading } = usePrizes();

	return (
		<>
			<DataTable columns={columns} data={prizes} isLoading={isLoading} />
		</>
	);
}
