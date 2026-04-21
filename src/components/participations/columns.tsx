import { ColumnDef } from '@tanstack/react-table';
import { Participation, PrizeType, PrizeTypeDisplayOptions, Status, StatusDisplayOptions } from '../../Types/Participation';
import DocumentsDataTableColumnHeaderCheckbox from '../tables/documents-checkbox-menu';
import { DataTableColumnHeaderSearch } from '../tables/search-menu';
import { isSelectedFilterFn } from './filters';
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
		id: 'phone',
		header: ({ column }) => (
			<DataTableColumnHeaderSearch column={column} title="Usuario" />
		),
		cell: ({ row }) => {
			const participation = row.original;
			return participation ? (
				<MessageHistory participation={participation} />
			) : null;
		},
	},
	{
		accessorFn: (row) => row.participation_data?.['prize_type'] as string | undefined,
		id: 'prize_type',
		header: ({ column }) => (
			<DocumentsDataTableColumnHeaderCheckbox
				column={column}
				title="Tipo de premio"
				id="prize_type"
				options={['physical', 'code']}
				displayOptions={PrizeTypeDisplayOptions}
			/>
		),
		filterFn: isSelectedFilterFn,
		cell: ({ row }) => {
			const prizeType = row.getValue<string>('prize_type') as PrizeType;
			return prizeType ? (PrizeTypeDisplayOptions[prizeType] ?? prizeType) : null;
		},
	},
	{
		accessorFn: (row) => row.participation_data?.['prize_name'] as string | undefined,
		id: 'prize_name',
		header: 'Premio',
		cell: ({ row }) => {
			const prizeName = row.getValue<string>('prize_name');
			return prizeName ? <div className="max-w-48 truncate" title={prizeName}>{prizeName}</div> : null;
		},
	},
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
			const status = row.getValue<Status>('status');
			return status ? (
				<div>
					{StatusDisplayOptions[status] ?? status}
				</div>
			) : null;
		},
	},
];
