import { z } from 'zod';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '../ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { ToggleGroup, ToggleGroupItem } from '../ui/toggle-group';
import { Checkbox } from '../ui/checkbox';
import { ScrollArea } from '../ui/scroll-area';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '../ui/alert-dialog';
import { DashboardUser } from '../../Types/User';
import { Flow } from '../../Types/Flow';
import { useUpdateUser } from '../../hooks/useUpdateUser';
import { useDeleteUser } from '../../hooks/useDeleteUser';

const formSchema = z.object({
    role: z.string().min(1),
    phone: z.string().optional(),
    password: z.string().optional(),
    allowed_flows: z.array(z.string()),
});

interface UserEditDialogProps {
    user: DashboardUser;
    flows: Flow[];
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => Promise<void>;
}

export default function UserEditDialog({
    user,
    flows,
    isOpen,
    onClose,
    onSuccess,
}: UserEditDialogProps) {
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            role: user.role,
            phone: user.phone ?? '',
            password: '',
            allowed_flows: user.allowed_flows ?? [],
        },
    });

    // Reset form when the selected user changes
    useEffect(() => {
        form.reset({
            role: user.role,
            phone: user.phone ?? '',
            password: '',
            allowed_flows: user.allowed_flows ?? [],
        });
    }, [user.id]); // eslint-disable-line react-hooks/exhaustive-deps

    const selectedRole = form.watch('role');

    const { updateUser, isLoading: isUpdating } = useUpdateUser(async () => {
        await onSuccess();
        onClose();
    });

    const { deleteUser, isLoading: isDeleting } = useDeleteUser(async () => {
        await onSuccess();
        setIsDeleteOpen(false);
        onClose();
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        const payload: {
            role: string;
            phone?: string | null;
            password?: string;
            allowed_flows?: string[] | null;
        } = { role: values.role };

        payload.phone = values.phone === '' ? null : (values.phone ?? null);

        if (values.password && values.password.length > 0) {
            payload.password = values.password;
        }

        payload.allowed_flows =
            values.role === 'report' ? values.allowed_flows : null;

        await updateUser(user.username, payload);
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
            <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                    <DialogTitle>{user.username}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="role"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Rol</FormLabel>
                                    <div className="flex">
                                        <ToggleGroup
                                            type="single"
                                            variant="outline"
                                            value={field.value}
                                            onValueChange={field.onChange}
                                        >
                                            <ToggleGroupItem value="admin">
                                                Administrador
                                            </ToggleGroupItem>
                                            <ToggleGroupItem value="validator">
                                                Validador
                                            </ToggleGroupItem>
                                            <ToggleGroupItem value="report">
                                                Reporte
                                            </ToggleGroupItem>
                                        </ToggleGroup>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Teléfono (opcional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="+521234567890" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Nueva contraseña (dejar vacío para no cambiar)
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="********"
                                            type="password"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        {selectedRole === 'report' && (
                            <FormField
                                control={form.control}
                                name="allowed_flows"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Flujos permitidos</FormLabel>
                                        <ScrollArea className="h-40 border rounded-md p-2">
                                            <div className="space-y-2">
                                                {flows.map((flow) => (
                                                    <div
                                                        key={flow.name}
                                                        className="flex items-center gap-2"
                                                    >
                                                        <Checkbox
                                                            id={`flow-${flow.name}`}
                                                            checked={field.value.includes(
                                                                flow.name,
                                                            )}
                                                            onCheckedChange={(checked) => {
                                                                if (checked) {
                                                                    field.onChange([
                                                                        ...field.value,
                                                                        flow.name,
                                                                    ]);
                                                                } else {
                                                                    field.onChange(
                                                                        field.value.filter(
                                                                            (n) => n !== flow.name,
                                                                        ),
                                                                    );
                                                                }
                                                            }}
                                                        />
                                                        <label
                                                            htmlFor={`flow-${flow.name}`}
                                                            className="text-sm cursor-pointer"
                                                        >
                                                            {flow.display_name}
                                                        </label>
                                                    </div>
                                                ))}
                                            </div>
                                        </ScrollArea>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}
                        <DialogFooter className="flex justify-between">
                            <AlertDialog
                                open={isDeleteOpen}
                                onOpenChange={setIsDeleteOpen}
                            >
                                <AlertDialogTrigger asChild>
                                    <Button type="button" variant="destructive">
                                        Eliminar usuario
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>¿Seguro?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Esta acción no se puede revertir.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={() => deleteUser(user.id)}
                                            disabled={isDeleting}
                                        >
                                            Continuar
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                            <Button type="submit" disabled={isUpdating}>
                                Guardar
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
