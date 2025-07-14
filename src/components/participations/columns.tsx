import { ColumnDef } from '@tanstack/react-table';
import { Participation, Status } from '../../Types/Participation';
import DocumentsDataTableColumnHeaderCheckbox from '../tables/documents-checkbox-menu';
import { DataTableColumnHeaderSearch } from '../tables/search-menu';
import { isPhoneFilterFn, isSelectedFilterFn } from './filters';
import MessageHistory from './components/MessageHistory';
import { Minus, Plus } from 'lucide-react';
import TypeDataTableColumnHeaderCheckbox from '../tables/type-checkbox-menu';

interface expandButtonProps {
	children?: React.ReactNode;
}

const ExpandButton = ({ children }: expandButtonProps) => {
	return (
		<div className="w-fit h-fit border-2 border-black rounded-sm">
			{children}
		</div>
	);
};

const StatusDisplayOptions: Record<Status, string> = {
	complete: 'Completo',
	pending: 'Pendiente',
	incomplete: 'Incompleto',
	rejected: 'Rechazado',
	approved: 'Aprobado',
	fullfiled: 'Entregado',
	documents: 'Documentos',
};

const prizeTypeDisplayOptions: Record<string, string> = {
	physical: 'Físico',
	digital: 'Digital',
};

export const columns: ColumnDef<Participation>[] = [
	{
		id: 'more',
		header: () => null,
		cell: ({ row }) => {
			return (
				row.getCanExpand() && (
					<button
						{...{
							onClick: row.getToggleExpandedHandler(),
							style: { cursor: 'pointer' },
						}}
					>
						{row.getIsExpanded() ? (
							<ExpandButton>
								<Minus size={16} />
							</ExpandButton>
						) : (
							<ExpandButton>
								<Plus size={16} />
							</ExpandButton>
						)}
					</button>
				)
			);
		},
	},
	{
		accessorKey: 'priorityNumber',
		id: 'priorityNumber',
		header: ({ column }) => (
			<DataTableColumnHeaderSearch column={column} title="Num" />
		),
		cell: ({ row }) => {
			const priorityNumber = row.getValue<number>('priorityNumber');
			return <div>{priorityNumber > 0 ? priorityNumber : ''}</div>;
		},
	},
	{
		accessorKey: 'datetime',
		header: 'Fecha',
		cell: ({ row }) => {
			let date = row.getValue('datetime');
			if (!(date instanceof Date)) {
				return null;
			}
			const padToTwoDigits = (num: number) => num.toString().padStart(2, '0');
			const formattedDate = `
	        ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear().toString().slice(-2)}
	        ${padToTwoDigits(date.getHours())}:${padToTwoDigits(date.getMinutes())}:${padToTwoDigits(date.getSeconds())}
            `;
			return <div>{formattedDate}</div>;
		},
	},
	{
		accessorKey: 'user.phone',
		id: 'user.phone',
		header: ({ column }) => (
			<DataTableColumnHeaderSearch column={column} title="Celular" />
		),
		filterFn: isPhoneFilterFn,
		cell: ({ row }) => {
			const participation = row.original;
			return participation ? (
				<MessageHistory participation={participation} />
			) : null;
		},
	},
	{
		accessorKey: 'prize',
		header: 'Premio',
	},
	{
		accessorKey: 'prize_type',
		id: 'prize_type',
		header: ({ column }) => (
			<TypeDataTableColumnHeaderCheckbox
				column={column}
				title="Tipo"
				options={[
					'physical',
					'digital',
				]}
				displayOptions={StatusDisplayOptions}
			/>
		),
		filterFn: isSelectedFilterFn,
		cell: ({ row }) => {
			const prizeType = row.getValue<string>('prize_type');
			return prizeType ? prizeTypeDisplayOptions[prizeType] : null;
		},
	},
	{
		accessorKey: 'status',
		id: 'status',
		header: ({ column }) => (
			<DocumentsDataTableColumnHeaderCheckbox
				column={column}
				title="Estado"
				options={[
					'documents',
					'complete',
					'pending',
					'incomplete',
					'rejected',
					'approved',
					'fullfiled',
				]}
				displayOptions={StatusDisplayOptions}
			/>
		),
		filterFn: isSelectedFilterFn,
		cell: ({ row }) => {
			const status = row.getValue<string>('status') as Status;
			return status ? (
				<div>
					{StatusDisplayOptions[status] ? StatusDisplayOptions[status] : status}
				</div>
			) : null;
		},
	},
];
