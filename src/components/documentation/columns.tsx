import { ColumnDef } from '@tanstack/react-table';
import { DocumentationUser } from '../../Types/Documentation';

export const columns: ColumnDef<DocumentationUser>[] = [
	{
		accessorKey: 'user_display_name',
		header: 'Nombre',
		cell: ({ row }) => {
			return <div>{row.original.user_display_name}</div>;
		},
	},
	{
		accessorKey: 'number',
		header: 'Teléfono',
		cell: ({ row }) => {
			return <div>{row.original.number}</div>;
		},
	},
];
