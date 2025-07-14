import { useEffect, useState } from 'react';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Column } from '@tanstack/react-table';
import { cn } from '../../lib/utils';
import { Filter } from 'lucide-react';

interface DataTableColumnHeaderProps<TData, TValue> {
	column: Column<TData, TValue>;
	title: string;
	className?: string;
	options: string[];
	displayOptions?: { [key: string]: string };
}

export default function TypeDataTableColumnHeaderCheckbox<TData, TValue>({
	column,
	title,
	className,
	options,
	displayOptions,
}: DataTableColumnHeaderProps<TData, TValue>) {
	const [isOpen, setIsOpen] = useState(false);

	if (!column.getCanFilter()) {
		return <div className={cn(className)}>{title}</div>;
	}
	const [selectedOptions, setSelectedOptions] = useState(
		['physical', 'digital'],
	);

	const handleOptionChange = (checked: boolean, id: string) => {
		setSelectedOptions((prevSelected) =>
			checked
				? [...prevSelected, id]
				: prevSelected.filter((optionId) => optionId !== id),
		);
	};

	useEffect(() => {
		column.setFilterValue(selectedOptions);
	}, [selectedOptions, column]);



	return (
		<div className={`flex items-center space-x-2 ${className}`}>
			<DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
				<DropdownMenuTrigger asChild>
					<Button
						variant="ghost"
						size="sm"
						className="-ml-3 h-8 data-[state=open]:bg-accent"
					>
						<span>{title}</span>
						<Filter />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="start">
					{options.map((option) => (
						<DropdownMenuItem
							key={option}
							asChild
							onSelect={(e) => e.preventDefault()}
						>
							<div className="flex items-center">
								<Checkbox
									checked={selectedOptions.includes(option)}
									onCheckedChange={(checked) =>
										handleOptionChange(checked as boolean, option)
									}
								/>
								<span className="ml-2">
									{displayOptions && displayOptions[option]
										? displayOptions[option]
										: option}
								</span>
							</div>
						</DropdownMenuItem>
					))}
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}
