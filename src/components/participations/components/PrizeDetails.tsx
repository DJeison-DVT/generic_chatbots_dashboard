import { LoaderCircle } from 'lucide-react';
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from '../../ui/sheet';
import { Participation } from '../../../Types/Participation';
import { useCodes } from '../../../hooks/useCodes';
import { useState } from 'react';

interface PrizeDetailsProps {
	participation: Participation;
}

export default function PrizeDetails({ participation }: PrizeDetailsProps) {
	const prizeName = participation.participation_data?.['prize_name'] as string | undefined;
	const [isOpen, setIsOpen] = useState(false);
	const { codes, isLoading } = useCodes(participation.id, participation.flow_name, isOpen);

	if (!prizeName) {
		return null;
	}

	return (
		<Sheet open={isOpen} onOpenChange={setIsOpen}>
			<SheetTrigger>
				<div className="text-blue-600 max-w-48 truncate" title={prizeName}>
					{prizeName}
				</div>
			</SheetTrigger>
			<SheetContent className="flex flex-col bg-dark text-white flex-1 h-full">
				<SheetHeader className="flex-0 flex flex-col">
					<SheetTitle className="text-white text-2xl">
						Detalles del premio
					</SheetTitle>
				</SheetHeader>
				<div className="flex flex-col gap-4 overflow-y-auto flex-1">
					{isLoading ? (
						<div className="w-full flex justify-center h-full items-center">
							<LoaderCircle className="animate-spin" />
						</div>
					) : codes.length === 0 ? (
						<div className="text-muted-foreground text-center mt-4">
							Sin códigos asignados
						</div>
					) : (
						codes.map((code) => (
							<div
								key={code.id}
								className="border border-white/20 rounded-md p-4 flex flex-col gap-2"
							>
								{code.name && (
									<div className="text-sm text-muted-foreground">{code.name}</div>
								)}
								<div className="font-mono text-lg">{code.code}</div>
								{code.link && (
									<a
										href={code.link}
										target="_blank"
										rel="noopener noreferrer"
										className="text-blue-400 underline text-sm truncate"
									>
										{code.link}
									</a>
								)}
								<div className="text-xs text-muted-foreground">
									{code.taken ? 'Entregado' : 'Pendiente'}
								</div>
							</div>
						))
					)}
				</div>
			</SheetContent>
		</Sheet>
	);
}
