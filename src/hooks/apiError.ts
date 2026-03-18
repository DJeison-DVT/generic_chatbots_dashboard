import { toast } from '../components/ui/use-toast';

export function handleApiError(title: string, description?: string | number): void {
	toast({ title, description });
}

export function handleCaughtError(error: unknown, context: string): void {
	console.error(`${context}:`, error);
}
