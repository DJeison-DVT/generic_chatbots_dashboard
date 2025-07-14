import { MouseEvent, ReactNode, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTrigger,
} from './dialog';
import '../styles/full-image.css';

interface FullImageProps {
    children: ReactNode;
    src: string;
    alt: string;
    setParentField?: (field: string) => void;
}

export default function FullImage({
    children,
    src,
    alt,
    setParentField,
}: FullImageProps) {
    const [field, setField] = useState<string>('');

    const handleZoom = (e: MouseEvent<HTMLDivElement>) => {
        const zoomer = e.currentTarget;
        let offsetX = 0;
        let offsetY = 0;
        if (e instanceof TouchEvent) {
            offsetX = e.nativeEvent.offsetX || e.touches?.[0].pageX || 0;
            offsetY = e.nativeEvent.offsetY || e.touches?.[0].pageY || 0;
            // I'm a TouchEvent
        } else {
            offsetX = e.nativeEvent.offsetX || e.pageX || 0;
            offsetY = e.nativeEvent.offsetY || e.pageY || 0;
            // I'm a MouseEvent
        }
        const x = (offsetX / zoomer.offsetWidth) * 100;
        const y = (offsetY / zoomer.offsetHeight) * 100;
        zoomer.style.backgroundPosition = `${x}% ${y}%`;
    };

    return (
        <Dialog>
            <DialogTrigger>{children}</DialogTrigger>
            <DialogContent className="max-w-fit max-h-screen overflow-auto">
                <DialogHeader>
                    <DialogDescription>
                        <div className="w-full px-4 h-full flex gap-4">
                            <figure
                                className="zoom"
                                style={{
                                    backgroundImage: `url(${src})`,
                                }}
                                onMouseMove={handleZoom}
                            >
                                <img src={src} alt={alt} className="opacity-transition" />
                            </figure>
                            {setParentField && (
                                <input
                                    type="text"
                                    className="h-fit border-2 border-black p-2 rounded-md"
                                    value={field}
                                    onChange={(e) => {
                                        setField(e.target.value);
                                        setParentField(e.target.value);
                                    }}
                                />
                            )}
                        </div>
                    </DialogDescription>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    );
}
