import { useState } from 'react';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '../../ui/dialog';
import { Button } from '../../ui/button';
import settings from '../../../settings';
import { DocumentationUser, DocumentationVerdict } from '../../../Types/Documentation';
import FullImage from '../../ui/full-image';

interface DocumentationDialogProps {
	user: DocumentationUser;
	onAccept: (userId: string) => Promise<void>;
	onReject: (userId: string, verdict: DocumentationVerdict) => Promise<void>;
}

type Step = 1 | 2 | 3;

export default function DocumentationDialog({
	user,
	onAccept,
	onReject,
}: DocumentationDialogProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [step, setStep] = useState<Step>(1);
	const [ineApproved, setIneApproved] = useState<boolean | null>(null);
	const [proofApproved, setProofApproved] = useState<boolean | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const reset = () => {
		setStep(1);
		setIneApproved(null);
		setProofApproved(null);
		setIsSubmitting(false);
	};

	const handleOpenChange = (open: boolean) => {
		setIsOpen(open);
		if (!open) reset();
	};

	const handleIneVerdict = (approved: boolean) => {
		setIneApproved(approved);
		setStep(proofApproved !== null ? 3 : 2);
	};

	const handleProofVerdict = (approved: boolean) => {
		setProofApproved(approved);
		setStep(ineApproved !== null ? 3 : 1);
	};

	const handleSubmit = async () => {
		setIsSubmitting(true);
		try {
			if (ineApproved && proofApproved) {
				await onAccept(user.id);
			} else {
				const verdict: DocumentationVerdict = {
					ine_front: !ineApproved,
					ine_back: !ineApproved,
					proof_of_address: !proofApproved,
				};
				await onReject(user.id, verdict);
			}
			setIsOpen(false);
			reset();
		} catch {
			setIsSubmitting(false);
		}
	};

	const stepIndicator = (
		<div className="flex items-center justify-center gap-2 mb-5">
			{/* Step 1: INE */}
			<div className="flex items-center gap-1.5">
				<div
					className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${
						step === 1
							? 'bg-accent text-white'
							: ineApproved === true
								? 'bg-green-500 text-white'
								: ineApproved === false
									? 'bg-red-500 text-white'
									: 'bg-muted text-muted-foreground'
					}`}
				>
					{step > 1 ? (ineApproved ? '✓' : '✗') : '1'}
				</div>
				<span className={`text-xs font-medium ${step === 1 ? 'text-accent font-bold' : ineApproved ? 'text-green-500' : ineApproved === false ? 'text-red-500' : 'text-gray-500'}`}>
					INE
				</span>
			</div>
			<div className={`w-10 h-px ${step > 1 ? (ineApproved ? 'bg-green-500' : 'bg-red-500') : 'bg-gray-600'}`} />

			{/* Step 2: Domicilio */}
			<div className="flex items-center gap-1.5">
				<div
					className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${
						step === 2
							? 'bg-accent text-white'
							: proofApproved === true
								? 'bg-green-500 text-white'
								: proofApproved === false
									? 'bg-red-500 text-white'
									: 'bg-muted text-muted-foreground'
					}`}
				>
					{step > 2 ? (proofApproved ? '✓' : '✗') : '2'}
				</div>
				<span className={`text-xs font-medium ${step === 2 ? 'text-accent font-bold' : proofApproved ? 'text-green-500' : proofApproved === false ? 'text-red-500' : 'text-gray-500'}`}>
					Domicilio
				</span>
			</div>
			<div className={`w-10 h-px ${step > 2 ? (proofApproved ? 'bg-green-500' : 'bg-red-500') : 'bg-gray-600'}`} />

			{/* Step 3: Resumen */}
			<div className="flex items-center gap-1.5">
				<div
					className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${
						step === 3
							? 'bg-accent text-white'
							: 'bg-muted text-muted-foreground'
					}`}
				>
					3
				</div>
				<span className={`text-xs font-medium ${step === 3 ? 'text-accent font-bold' : 'text-gray-500'}`}>
					Resumen
				</span>
			</div>
		</div>
	);

	const userInfoBar = (
		<div className="bg-dark/50 p-2 px-3.5 rounded-md mb-4 flex gap-4 items-center text-xs">
			<span className="text-white font-medium">{user.user_display_name}</span>
			<span className="text-accent-foreground">{user.number.slice(13)}</span>
			{!!user.chatbot_data?.['email'] && (
				<span className="text-gray-300">{String(user.chatbot_data['email'])}</span>
			)}
		</div>
	);

	return (
		<Dialog open={isOpen} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>
				<Button>Revisar</Button>
			</DialogTrigger>
			<DialogContent className="min-w-[700px] max-h-[90vh] flex flex-col">
				<DialogHeader>
					<DialogTitle>Revisión de Documentos</DialogTitle>
				</DialogHeader>
				<DialogDescription asChild>
					<div className="flex flex-col flex-1 overflow-auto">
						{stepIndicator}
						{userInfoBar}

						{/* Step 1: INE Front & Back */}
						{step === 1 && (
							<div className="flex flex-col gap-3">
								<div className="flex gap-3">
									<div className="bg-dark/30 rounded-lg p-2.5 flex-1">
										<div className="text-xs text-muted-foreground uppercase mb-1.5">INE Frente</div>
										<FullImage
											src={settings.bucketURL + (user.chatbot_data.ine_front_url ?? '')}
											alt="INE Frente"
										>
											<img
												src={settings.bucketURL + (user.chatbot_data.ine_front_url ?? '')}
												alt="INE Frente"
												className="w-full max-h-[250px] object-contain cursor-pointer"
											/>
										</FullImage>
									</div>
									<div className="bg-dark/30 rounded-lg p-2.5 flex-1">
										<div className="text-xs text-muted-foreground uppercase mb-1.5">INE Reverso</div>
										<FullImage
											src={settings.bucketURL + (user.chatbot_data.ine_back_url ?? '')}
											alt="INE Reverso"
										>
											<img
												src={settings.bucketURL + (user.chatbot_data.ine_back_url ?? '')}
												alt="INE Reverso"
												className="w-full max-h-[250px] object-contain cursor-pointer"
											/>
										</FullImage>
									</div>
								</div>
								<div className="flex gap-3 justify-end mt-2">
									<Button variant="destructive" onClick={() => handleIneVerdict(false)}>
										Rechazar INE
									</Button>
									<Button variant="secondary" onClick={() => handleIneVerdict(true)}>
										Aprobar INE →
									</Button>
								</div>
							</div>
						)}

						{/* Step 2: Proof of Address */}
						{step === 2 && (
							<div className="flex flex-col gap-3">
								<div className="bg-dark/30 rounded-lg p-2.5 max-w-[400px] mx-auto w-full">
									<div className="text-xs text-muted-foreground uppercase mb-1.5">Comprobante de Domicilio</div>
									<FullImage
										src={settings.bucketURL + (user.chatbot_data.proof_of_address_url ?? '')}
										alt="Comprobante de Domicilio"
									>
										<img
											src={settings.bucketURL + (user.chatbot_data.proof_of_address_url ?? '')}
											alt="Comprobante de Domicilio"
											className="w-full max-h-[300px] object-contain cursor-pointer"
										/>
									</FullImage>
								</div>
								<div className="flex gap-3 justify-end mt-2">
									<Button variant="destructive" onClick={() => handleProofVerdict(false)}>
										Rechazar Domicilio
									</Button>
									<Button variant="secondary" onClick={() => handleProofVerdict(true)}>
										Aprobar Domicilio →
									</Button>
								</div>
							</div>
						)}

						{/* Step 3: Summary */}
						{step === 3 && (
							<div className="flex flex-col gap-3">
								<div
									className={`bg-dark/30 p-3.5 rounded-lg flex justify-between items-center border-l-[3px] cursor-pointer hover:opacity-80 ${
										ineApproved ? 'border-l-green-500' : 'border-l-red-500'
									}`}
									onClick={() => setStep(1)}
								>
									<div>
										<div className="text-sm font-medium text-primary">INE (Frente y Reverso)</div>
									</div>
									<div className={`text-sm font-semibold ${ineApproved ? 'text-green-500' : 'text-red-500'}`}>
										{ineApproved ? '✓ Aprobado' : '✗ Rechazado'}
									</div>
								</div>
								<div
									className={`bg-dark/30 p-3.5 rounded-lg flex justify-between items-center border-l-[3px] cursor-pointer hover:opacity-80 ${
										proofApproved ? 'border-l-green-500' : 'border-l-red-500'
									}`}
									onClick={() => setStep(2)}
								>
									<div>
										<div className="text-sm font-medium text-primary">Comprobante de Domicilio</div>
									</div>
									<div className={`text-sm font-semibold ${proofApproved ? 'text-green-500' : 'text-red-500'}`}>
										{proofApproved ? '✓ Aprobado' : '✗ Rechazado'}
									</div>
								</div>
								<div className="flex gap-3 justify-end mt-2">
									<Button
										variant="secondary"
										onClick={handleSubmit}
										disabled={isSubmitting}
									>
										Enviar Revisión
									</Button>
								</div>
							</div>
						)}
					</div>
				</DialogDescription>
			</DialogContent>
		</Dialog>
	);
}
