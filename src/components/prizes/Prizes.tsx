import { useState, useEffect } from 'react';
import { DataTable } from './data-table';
import { columns } from './columns';
import { usePrizes } from '../../hooks/usePrizes';
import { useNotificationPreference } from '../../hooks/useNotificationPreference';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { Toggle } from '../ui/toggle';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

export default function Prizes() {
    const { prizes, isLoading } = usePrizes();
    const { currentUser } = useCurrentUser();
    const { preference, toggle, updateThreshold } = useNotificationPreference();

    const [thresholdInput, setThresholdInput] = useState<number>(50);
    const [thresholdDirty, setThresholdDirty] = useState(false);

    // Sync threshold input when preference loads
    useEffect(() => {
        if (preference?.threshold !== undefined) {
            setThresholdInput(preference.threshold);
            setThresholdDirty(false);
        }
    }, [preference?.threshold]);

    const handleThresholdChange = (val: string) => {
        const n = parseInt(val, 10);
        if (!isNaN(n) && n >= 0) {
            setThresholdInput(n);
            setThresholdDirty(n !== (preference?.threshold ?? 50));
        }
    };

    const handleSaveThreshold = async () => {
        await updateThreshold(thresholdInput);
        setThresholdDirty(false);
    };

    return (
        <>
            <div className="mx-4 mt-4 p-4 border border-dark/20 rounded-lg flex items-center gap-4 flex-wrap">
                <div className="flex-1 min-w-48">
                    <div className="text-sm font-medium">Alerta de código bajo</div>
                    <div className="text-xs text-slate-500">
                        Notificación SMS cuando queden pocos códigos en este flujo
                    </div>
                </div>
                {!currentUser?.phone ? (
                    <div className="text-sm text-amber-600">
                        Agrega un teléfono a tu perfil para recibir alertas por SMS.
                    </div>
                ) : (
                    <div className="flex items-center gap-3 flex-wrap">
                        <Toggle
                            pressed={preference?.enabled ?? false}
                            onPressedChange={toggle}
                            aria-label="Activar alerta de código bajo"
                            variant="outline"
                        >
                            {preference?.enabled ? 'Activa' : 'Inactiva'}
                        </Toggle>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-500 whitespace-nowrap">
                                Notificar con menos de
                            </span>
                            <Input
                                type="number"
                                min={0}
                                className="w-20"
                                value={thresholdInput}
                                onChange={(e) => handleThresholdChange(e.target.value)}
                                disabled={!preference}
                            />
                            <span className="text-sm text-slate-500">códigos</span>
                        </div>
                        {thresholdDirty && (
                            <Button size="sm" onClick={handleSaveThreshold}>
                                Guardar
                            </Button>
                        )}
                    </div>
                )}
            </div>
            <DataTable columns={columns} data={prizes} isLoading={isLoading} />
        </>
    );
}
