import {
	ColumnDef,
	flexRender,
	getCoreRowModel,
	useReactTable,
} from '@tanstack/react-table';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '../ui/table';
import { LoaderCircle, RefreshCw } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { Button } from '../ui/button';

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	isLoading: boolean;
	onRefresh: () => void;
}

export function DataTable<TData, TValue>({
	columns,
	data,
	isLoading,
	onRefresh,
}: DataTableProps<TData, TValue>) {
	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	return (
		<div className="flex flex-col flex-1 gap-3 p-10 pb-5 max-h-full">
			<ScrollArea className="flex flex-col flex-1 overflow-auto">
				<div className="rounded-md border">
					<div className="relative">
						<Table>
							<TableHeader className="sticky top-0 bg-primary z-10">
								{table.getHeaderGroups().map((headerGroup) => (
									<TableRow key={headerGroup.id}>
										{headerGroup.headers.map((header) => (
											<TableHead key={header.id}>
												{header.isPlaceholder
													? null
													: flexRender(
															header.column.columnDef.header,
															header.getContext(),
														)}
											</TableHead>
										))}
									</TableRow>
								))}
							</TableHeader>
							<TableBody>
								{table.getRowModel().rows?.length ? (
									table.getRowModel().rows.map((row) => (
										<TableRow key={row.id}>
											{row.getVisibleCells().map((cell) => (
												<TableCell key={cell.id}>
													{flexRender(
														cell.column.columnDef.cell,
														cell.getContext(),
													)}
												</TableCell>
											))}
										</TableRow>
									))
								) : (
									<TableRow>
										<TableCell colSpan={columns.length}>
											{isLoading ? (
												<div className="w-full flex justify-center">
													<LoaderCircle className="animate-spin" />
												</div>
											) : (
												<div className="text-center">
													No hay documentos pendientes de revisión
												</div>
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
			</div>
		</div>
	);
}
