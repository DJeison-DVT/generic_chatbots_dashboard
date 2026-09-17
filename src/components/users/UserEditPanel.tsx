import { z } from 'zod';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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

const roleLabel: Record<string, string> = {
    admin: 'Administrador',
    validator: 'Validador',
    report: 'Reporte',
};

const roleBadge: Record<string, string> = {
    admin: 'bg-dark text-primary',
    validator: 'bg-blue-600 text-white',
    report: 'bg-slate-400 text-white',
};

const formSchema = z.object({
    role: z.string().min(1),
    phone: z.string().optional(),
    password: z.string().optional(),
    allowed_flows: z.array(z.string()),
});

interface UserEditPanelProps {
    user: DashboardUser;
    flows: Flow[];
    onClose: () => void;
    onSuccess: () => Promise<void>;
}

export default function UserEditPanel({
    user,
    flows,
    onClose,
    onSuccess,
}: UserEditPanelProps) {
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

    const badge = roleBadge[user.role] ?? 'bg-slate-300 text-white';
    const label = roleLabel[user.role] ?? user.role;

    return (
        <div className="flex flex-col h-full border-l-2 border-dark/20">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-dark/10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-dark/15 flex items-center justify-center text-sm font-semibold text-dark shrink-0">
                        {user.username.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                        <div className="font-semibold">{user.username}</div>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badge}`}>
                            {label}
                        </span>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="text-slate-400 hover:text-slate-600 text-xl leading-none"
                    aria-label="Cerrar"
                >
                    ×
                </button>
            </div>

            {/* Scrollable form body */}
            <ScrollArea className="flex-1">
                <Form {...form}>
                    <form
                        id="user-edit-form"
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="px-6 py-4 space-y-5"
                    >
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
                                        Nueva contraseña{' '}
                                        <span className="text-slate-400 font-normal">
                                            (dejar vacío para no cambiar)
                                        </span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="••••••••"
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
                                        <div className="border rounded-md divide-y">
                                            {flows.map((flow) => (
                                                <label
                                                    key={flow.name}
                                                    htmlFor={`flow-${flow.name}`}
                                                    className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-dark/5"
                                                >
                                                    <Checkbox
                                                        id={`flow-${flow.name}`}
                                                        checked={field.value.includes(flow.name)}
                                                        onCheckedChange={(checked) => {
                                                            if (checked) {
                                                                field.onChange([...field.value, flow.name]);
                                                            } else {
                                                                field.onChange(
                                                                    field.value.filter((n) => n !== flow.name),
                                                                );
                                                            }
                                                        }}
                                                    />
                                                    <span className="text-sm">{flow.display_name}</span>
                                                </label>
                                            ))}
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}
                    </form>
                </Form>
            </ScrollArea>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-dark/10">
                <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                    <AlertDialogTrigger asChild>
                        <Button type="button" variant="destructive" size="sm">
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

                <Button
                    type="submit"
                    form="user-edit-form"
                    disabled={isUpdating}
                    size="sm"
                >
                    Guardar
                </Button>
            </div>
        </div>
    );
}
