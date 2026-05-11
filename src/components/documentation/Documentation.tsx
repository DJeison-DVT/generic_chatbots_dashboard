import { ColumnDef } from '@tanstack/react-table';
import { DocumentationUser } from '../../Types/Documentation';
import { columns as baseColumns } from './columns';
import { DataTable } from './data-table';
import DocumentationDialog from './components/DocumentationDialog';
import { useDocumentation } from '../../hooks/useDocumentation';
import { useFlows } from '../../hooks/useFlows';
import { flowStore } from '../../flowStore';

export default function Documentation() {
	const { users, isLoading, fetchUsers, acceptDocumentation, rejectDocumentation } =
		useDocumentation();
	const { flows } = useFlows();

	const selectedFlowName = flowStore.getSelectedFlow();
	const flow = flows.find((f) => f.name === selectedFlowName);
	const hasEmail = flow?.data_fields?.some((f) => f.name === 'email');

	const emailColumn: ColumnDef<DocumentationUser> = {
		id: 'email',
		header: 'Email',
		cell: ({ row }) => {
			const email = row.original.chatbot_data?.['email'];
			return <div>{email ? String(email) : ''}</div>;
		},
	};

	const reviewColumn: ColumnDef<DocumentationUser> = {
		id: 'review',
		header: 'Revisión',
		cell: ({ row }) => {
			const docUser = row.original;
			return (
				<DocumentationDialog
					user={docUser}
					onAccept={acceptDocumentation}
					onReject={rejectDocumentation}
				/>
			);
		},
	};

	const columns = [
		...baseColumns,
		...(hasEmail ? [emailColumn] : []),
		reviewColumn,
	];

	return (
		<DataTable
			columns={columns}
			data={users}
			isLoading={isLoading}
			onRefresh={fetchUsers}
		/>
	);
}
