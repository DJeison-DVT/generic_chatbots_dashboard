import {
	ColumnDef,
	ColumnFiltersState,
	SortingState,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
	Row,
	getExpandedRowModel,
} from '@tanstack/react-table';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '../ui/table';
import { Fragment, useEffect, useState } from 'react';
import { LoaderCircle, RefreshCw } from 'lucide-react';

import { ScrollArea } from '../ui/scroll-area';
import { DataTablePagination } from '../tables/pagination';
import { isSelectedFilterFn } from './filters';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../ui/button';

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	isLoading: boolean;
	onRefresh: () => Promise<void>;
	renderSubComponent: (props: { row: Row<TData> }) => React.ReactElement;
	getRowCanExpand: (row: Row<TData>) => boolean;
}

export function DataTable<TData, TValue>({
	columns,
	data,
	isLoading,
	onRefresh,
	renderSubComponent,
	getRowCanExpand,
}: DataTableProps<TData, TValue>) {
	const [sorting, setSorting] = useState<SortingState>([
		{ id: 'datetime', desc: true },
	]);
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([
		{ id: 'user.phone', value: searchParams.get('user.phone') || '' },
		{ id: 'priorityNumber', value: searchParams.get('priorityNumber') || '' },
	]);

	const table = useReactTable({
		data,
		columns,
		getRowCanExpand,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		onSortingChange: setSorting,
		getSortedRowModel: getSortedRowModel(),
		onColumnFiltersChange: setColumnFilters,
		getFilteredRowModel: getFilteredRowModel(),
		getExpandedRowModel: getExpandedRowModel(),
		initialState: {
			pagination: {
				pageSize: Number(searchParams.get('pageSize')) || 10,
				pageIndex: Number(searchParams.get('page')) - 1 || 0,
			},
		},
		state: {
			sorting,
			columnFilters,
		},
		filterFns: {
			isSelected: isSelectedFilterFn,
		},
	});

	useEffect(() => {
		const params = new URLSearchParams(searchParams.toString());
		const { pageIndex, pageSize } = table.getState().pagination;

		// Handle pagination parameters
		if (pageIndex === 0) {
			params.delete('page');
		} else {
			params.set('page', String(pageIndex + 1));
		}

		if (pageSize === 10) {
			params.delete('pageSize');
		} else {
			params.set('pageSize', String(pageSize));
		}

		// Handle column filters
		const requiredParams = ['priorityNumber', 'phone'];
		requiredParams.forEach((param) => {
			const filter = columnFilters.find((filter) => filter.id === param);
			if (filter && typeof filter.value === 'string') {
				params.set(filter.id, filter.value);
			} else {
				params.delete(param);
			}
		});


		// Handle status filter separately if needed
		const statusFilter = columnFilters.find((filter) => filter.id === 'status');
		if (statusFilter && Array.isArray(statusFilter.value)) {
			params.set('status', statusFilter.value.join(','));
		} else {
			params.delete('status');
		}

		console.log('filter', columnFilters);
		navigate({ search: params.toString() }, { replace: true });
	}, [table.getState().pagination, columnFilters, searchParams, navigate]);

	return (
		<div className="flex flex-col flex-1 gap-3 p-10 pb-5 max-h-full">
			<ScrollArea className="flex flex-col flex-1 overflow-auto ">
				<div className="rounded-md border ">
					<div className="relative">
						<Table>
							<TableHeader className="sticky top-0 bg-primary z-10">
								{table.getHeaderGroups().map((headerGroup) => (
									<TableRow key={headerGroup.id}>
										{headerGroup.headers.map((header) => {
											return (
												<TableHead key={header.id}>
													{header.isPlaceholder
														? null
														: flexRender(
															header.column.columnDef.header,
															header.getContext(),
														)}
												</TableHead>
											);
										})}
									</TableRow>
								))}
							</TableHeader>
							<TableBody>
								{table.getRowModel().rows?.length ? (
									table.getRowModel().rows.map((row) => (
										<Fragment key={row.id}>
											<TableRow data-state={row.getIsSelected() && 'selected'}>
												{row.getVisibleCells().map((cell) => (
													<TableCell key={cell.id}>
														{flexRender(
															cell.column.columnDef.cell,
															cell.getContext(),
														)}
													</TableCell>
												))}
											</TableRow>
											{row.getIsExpanded() && (
												<TableRow>
													<TableCell colSpan={columns.length}>
														{renderSubComponent({ row })}
													</TableCell>
												</TableRow>
											)}
										</Fragment>
									))
								) : (
									<TableRow>
										<TableCell colSpan={columns.length}>
											{isLoading ? (
												<div className="w-full flex justify-center">
													<LoaderCircle className="animate-spin" />
												</div>
											) : (
												<div className="text-center">No Existen Tickets</div>
											)}
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
					</div>
				</div>
			</ScrollArea>
			<div className="flex justify-between">
				<Button disabled={isLoading} onClick={onRefresh}>
					<RefreshCw />
				</Button>
				<DataTablePagination table={table} />
			</div>
		</div>
	);
}
