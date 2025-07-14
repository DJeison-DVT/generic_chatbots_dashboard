import { useState } from 'react';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Column } from '@tanstack/react-table';
import { cn } from '../../lib/utils';
import { Search } from 'lucide-react';

interface DataTableColumnHeaderProps<TData, TValue> {
	column: Column<TData, TValue>;
	title: string;
	className?: string;
}

export function DataTableColumnHeaderSearch<TData, TValue>({
	column,
	title,
	className,
}: DataTableColumnHeaderProps<TData, TValue>) {
	const [isOpen, setIsOpen] = useState(false);

	if (!column.getCanFilter()) {
		return <div className={cn(className)}>{title}</div>;
	}

	return (
		<div className={`flex items-center space-x-2 ${className}`}>
			<DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
				<DropdownMenuTrigger asChild>
					<Button
						variant="ghost"
						size="sm"
						className="-ml-3 h-8 data-[state=open]:bg-accent flex justify-between w-full"
					>
						<span>{title}</span>
						<Search />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="start">
					<DropdownMenuItem asChild onSelect={(e) => e.preventDefault()}>
						<Input
							placeholder="Buscar..."
							value={(column.getFilterValue() as string) || ''}
							onChange={(e) => column.setFilterValue(e.target.value)}
						/>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}
