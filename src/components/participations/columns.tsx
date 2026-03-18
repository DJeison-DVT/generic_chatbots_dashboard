import { ColumnDef } from '@tanstack/react-table';
import { Participation, Status } from '../../Types/Participation';
import DocumentsDataTableColumnHeaderCheckbox from '../tables/documents-checkbox-menu';
import { DataTableColumnHeaderSearch } from '../tables/search-menu';
import { isPhoneFilterFn, isSelectedFilterFn } from './filters';
import MessageHistory from './components/MessageHistory';
import { Minus, Plus } from 'lucide-react';

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
	in_progress: 'En progreso',
	pending_review: 'Pendiente de revisión',
	approved: 'Aprobado',
	rejected: 'Rechazado',
	completed: 'Completado',
};

// const prizeTypeDisplayOptions: Record<string, string> = {
// 	physical: 'Físico',
// 	digital: 'Digital',
// };

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
	// {
	// 	accessorKey: 'current_step',
	// 	id: 'current_step',
	// 	header: ({ column }) => (
	// 		<DataTableColumnHeaderSearch column={column} title="Paso" />
	// 	),
	// 	cell: ({ row }) => {
	// 		return <div>{row.getValue<string>('current_step')}</div>;
	// 	},
	// },
	{
		accessorKey: 'created_at',
		header: 'Fecha',
		cell: ({ row }) => {
			let date = row.getValue('created_at');
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
		accessorKey: 'user_id',
		id: 'user_id',
		header: ({ column }) => (
			<DataTableColumnHeaderSearch column={column} title="Usuario" />
		),
		filterFn: isPhoneFilterFn,
		cell: ({ row }) => {
			const participation = row.original;
			return participation ? (
				<MessageHistory participation={participation} />
			) : null;
		},
	},
	// {
	// 	accessorKey: 'prize_type',
	// 	id: 'prize_type',
	// 	header: ({ column }) => (
	// 		<DocumentsDataTableColumnHeaderCheckbox
	// 			column={column}
	// 			title="Tipo"
	// 			id="prize_type"
	// 			options={['physical', 'digital']}
	// 			displayOptions={StatusDisplayOptions}
	// 		/>
	// 	),
	// 	filterFn: isSelectedFilterFn,
	// 	cell: ({ row }) => {
	// 		const prizeType = row.getValue<string>('prize_type');
	// 		return prizeType ? prizeTypeDisplayOptions[prizeType] : null;
	// 	},
	// },
	{
		accessorKey: 'status',
		id: 'status',
		header: ({ column }) => (
			<DocumentsDataTableColumnHeaderCheckbox
				column={column}
				title="Estado"
				options={Object.keys(StatusDisplayOptions) as string[]}
				id="status"
				displayOptions={StatusDisplayOptions}
			/>
		),
		filterFn: isSelectedFilterFn,
		cell: ({ row }) => {
			var status = row.getValue<string>('status') as Status;
			status = status.toLowerCase() as Status;
			return status ? (
				<div>
					{StatusDisplayOptions[status] ? StatusDisplayOptions[status] : status}
				</div>
			) : null;
		},
	},
];
