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
	pageCount: number;
	renderSubComponent: (props: { row: Row<TData> }) => React.ReactElement;
	getRowCanExpand: (row: Row<TData>) => boolean;
}

export function DataTable<TData, TValue>({
	columns,
	data,
	isLoading,
	pageCount,
	renderSubComponent,
	getRowCanExpand,
}: DataTableProps<TData, TValue>) {
	const [sorting, setSorting] = useState<SortingState>([
		{ id: 'datetime', desc: true },
	]);
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const [searchParamsState, setSearchParamsState] = useState(
		searchParams.toString(),
	);
	const [previousFilters, setPreviousFilters] = useState<ColumnFiltersState>(
		[],
	);
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([
		{ id: 'priority_number', value: searchParams.get('priority_number') || '' },
		{ id: 'phone', value: searchParams.get('phone') || '' },
		{
			id: 'status',
			value: searchParams.getAll('status'),
		},
		{
			id: 'prize_type',
			value: searchParams.getAll('prize_type'),
		},
	]);

	const table = useReactTable({
		data,
		columns,
		manualFiltering: true,
		manualPagination: true,
		pageCount,
		getRowCanExpand,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		onSortingChange: setSorting,
		getSortedRowModel: getSortedRowModel(),
		onColumnFiltersChange: setColumnFilters,
		getFilteredRowModel: getFilteredRowModel(),
		getExpandedRowModel: getExpandedRowModel(),
		state: {
			sorting,
			columnFilters,
		},
		filterFns: {
			isSelected: isSelectedFilterFn,
		},
	});

	useEffect(() => {
		navigate({ search: searchParamsState }, { replace: true });
	}, [searchParamsState, navigate]);

	useEffect(() => {
		const params = new URLSearchParams();
		let { pageIndex } = table.getState().pagination;

		// Check if filters have changed (not just pagination)
		const filtersChanged =
			JSON.stringify(columnFilters) !== JSON.stringify(previousFilters);

		// Reset page index if filters changed and we're not on page 0
		if (filtersChanged && pageIndex > 0) {
			table.setPageIndex(0);
			pageIndex = 0; // Update local variable for URL params
		}

		// Update previous filters for next comparison
		if (filtersChanged) {
			setPreviousFilters([...columnFilters]);
		}

		// Handle pagination parameters
		if (pageIndex === 0) {
			params.delete('page');
		} else {
			params.set('page', String(pageIndex + 1));
		}

		// Handle string filters
		const stringFilters = [
			{ id: 'priority_number', param: 'priority_number' },
			{ id: 'phone', param: 'phone' },
		];

		stringFilters.forEach(({ id, param }) => {
			const filter = columnFilters.find((f) => f.id === id);
			const value = filter?.value;

			if (value && typeof value === 'string' && value.trim()) {
				params.set(param, value);
			} else {
				params.delete(param);
			}
		});

		// Handle array filters
		const arrayFilters = [
			{ id: 'status', param: 'status' },
			{ id: 'prize_type', param: 'prize_type' },
		];

		arrayFilters.forEach(({ id, param }) => {
			const filter = columnFilters.find((f) => f.id === id);
			const value = filter?.value;

			if (value && Array.isArray(value) && value.length > 0) {
				params.set(param, value.join(','));
			} else {
				params.delete(param);
			}
		});

		const newParamsString = params.toString();

		if (newParamsString !== searchParamsState) {
			setSearchParamsState(newParamsString);
		}
	}, [table.getState().pagination, columnFilters, previousFilters]);

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
				<Button
					disabled={isLoading}
					onClick={() =>
						(window.location.href =
							'/dashboard/participations?status=complete%2Cdocuments&prize_type=digital%2Cphysical')
					}
				>
					<RefreshCw />
				</Button>
				<DataTablePagination table={table} />
			</div>
		</div>
	);
}
