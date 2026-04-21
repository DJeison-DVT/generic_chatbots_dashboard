import { FilterFn, Row } from '@tanstack/react-table';

export const isSelectedFilterFn: FilterFn<any> = <TData>(
	row: Row<TData>,
	columnId: string,
	filterValues: string[],
) => {
	let value = row.getValue<string>(columnId);
	if (value !== null) {
		value = value.toLowerCase().trim();
	}
	return filterValues.includes(value);
};
