import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
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

export default function DocumentsDataTableColumnHeaderCheckbox<TData, TValue>({
	column,
	title,
	className,
	options,
	displayOptions,
}: DataTableColumnHeaderProps<TData, TValue>) {
	const [isOpen, setIsOpen] = useState(false);
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();

	if (!column.getCanFilter()) {
		return <div className={cn(className)}>{title}</div>;
	}
	const [selectedOptions, setSelectedOptions] = useState(
		searchParams.get('status')?.split(',') || ['documents', 'complete'],
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
		const params = new URLSearchParams(searchParams.toString());

		if (JSON.stringify(selectedOptions) === JSON.stringify(['complete', 'documents'])) {
			params.delete('status');
		} else {
			params.set('status', selectedOptions.join(','));
		}
		navigate({ search: params.toString() }, { replace: true });
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
