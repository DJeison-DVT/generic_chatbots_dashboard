import { ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeaderSearch } from '../tables/search-menu';
import { PrizeInfo } from '../../Types/Prizes';

const TypeDisplayOptions: Record<string, string> = {
	physical: 'Físico',
	digital: 'Digital',
}


export const columns: ColumnDef<PrizeInfo>[] = [
	{
		accessorKey: 'name',
		id: 'name',
		header: ({ column }) => (
			<DataTableColumnHeaderSearch column={column} title="Nombre/Cantidad" />
		),
	},
	{
		accessorKey: 'type',
		id: 'type',
		header: 'Tipo',
		cell: ({ row }) => {
			const prizeType = row.getValue<string>('type');
			return prizeType ? TypeDisplayOptions[prizeType] : null;
		}
	},
	{
		accessorKey: 'available',
		header: 'Disponibles/En espera',
	},
	{
		accessorKey: 'taken',
		header: 'Entregados',
	},
	{
		header: 'Total',
		accessorKey: 'total',
	},
];
