'use client';

import { useState } from 'react';
import { Camera, ArrowsLeftRight, X } from "@phosphor-icons/react";
import Image from "next/image";
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Photo {
    id: string;
    url: string;
    type: string;
    date: string;
}

interface PhotoGalleryProps {
    photos: Photo[];
}

export default function PhotoGallery({ photos }: PhotoGalleryProps) {
    const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
    const [comparePhoto, setComparePhoto] = useState<Photo | null>(null);
    const [isCompareMode, setIsCompareMode] = useState(false);
    const [opacity, setOpacity] = useState(50);

    // Group photos by type
    const frontPhotos = photos.filter(p => p.type === 'front');
    const backPhotos = photos.filter(p => p.type === 'back');
    const sidePhotos = photos.filter(p => p.type.includes('side'));

    const renderPhotoGrid = (title: string, items: Photo[]) => {
        if (items.length === 0) return null;
        return (
            <div className="mb-8">
                <h4 className="text-[10px] font-black text-zinc-500 uppercase mb-4 flex items-center gap-2 tracking-widest">
                    <Camera weight="duotone" size={16} /> {title}
                </h4>
                <div className="flex gap-4 overflow-x-auto pb-4 snap-x scrollbar-hide">
                    {items.map(photo => (
                        <button
                            key={photo.id}
                            onClick={() => {
                                if (isCompareMode) {
                                    setComparePhoto(photo);
                                } else {
                                    setSelectedPhoto(photo);
                                }
                            }}
                            className={`
                                relative min-w-[120px] h-[160px] rounded-2xl overflow-hidden snap-center border-2 transition-all duration-300
                                ${selectedPhoto?.id === photo.id ? 'border-acid-lime shadow-[0_0_15px_rgba(189,255,0,0.3)]' : 'border-white/5'}
                                ${comparePhoto?.id === photo.id ? 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]' : ''}
                            `}
                        >
                            <Image
                                src={photo.url}
                                alt={photo.type}
                                fill
                                className="object-cover"
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-deep-black/60 backdrop-blur-sm text-white text-[9px] p-2 text-center font-black uppercase tracking-wider">
                                {format(parseISO(photo.date), 'dd/MM/yy')}
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        );
    };

    const handleCompare = () => {
        setIsCompareMode(true);
        // Default compare to the previous photo of same type if available
        if (selectedPhoto) {
            const sameTypePhotos = photos.filter(p => p.type === selectedPhoto.type && p.id !== selectedPhoto.id);
            if (sameTypePhotos.length > 0) {
                setComparePhoto(sameTypePhotos[0]);
            }
        }
    };

    const closeViewer = () => {
        setSelectedPhoto(null);
        setComparePhoto(null);
        setIsCompareMode(false);
    };

    if (photos.length === 0) {
        return (
            <div className="bg-white p-6 rounded-3xl soft-shadow flex flex-col items-center justify-center min-h-[200px] text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
                    <Camera size={32} weight="duotone" />
                </div>
                <h3 className="text-lg font-bold text-slate-700">Galeria Vazia</h3>
                <p className="text-slate-400 max-w-xs text-sm">
                    As fotos das suas avaliações físicas aparecerão aqui para comparação.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-surface-grey border border-white/5 p-6 rounded-[32px] relative overflow-hidden">
            <h3 className="text-sm font-black text-white mb-6 flex items-center gap-2 uppercase tracking-widest">
                <span className="w-1.5 h-4 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]"></span>
                Galeria de Fotos
            </h3>

            {renderPhotoGrid("Frente", frontPhotos)}
            {renderPhotoGrid("Costas", backPhotos)}
            {renderPhotoGrid("Perfil", sidePhotos)}

            {/* Viewer / Comparison Modal */}
            {selectedPhoto && (
                <div className="fixed inset-0 bg-deep-black/95 z-50 flex flex-col animate-in fade-in duration-300 backdrop-blur-xl">

                    {/* Header */}
                    <div className="p-6 flex justify-between items-center text-white border-b border-white/5">
                        <div>
                            <h3 className="font-black text-xl tracking-tight">
                                {isCompareMode ? 'Evolução Ghost' : 'Visualização'}
                            </h3>
                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">
                                {format(parseISO(selectedPhoto.date), 'dd MMMM yyyy', { locale: ptBR })}
                            </p>
                        </div>
                        <button onClick={closeViewer} className="w-12 h-12 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-all">
                            <X size={24} weight="bold" />
                        </button>
                    </div>

                    {/* Main Stage */}
                    <div className="flex-1 relative flex items-center justify-center p-6 overflow-hidden">

                        {isCompareMode && comparePhoto ? (
                            <div className="relative w-full max-w-md aspect-[3/4] rounded-3xl overflow-hidden border-2 border-white/10 shadow-2xl">
                                {/* Base Photo (Older usually) */}
                                <Image
                                    src={comparePhoto.url}
                                    alt="Base"
                                    fill
                                    className="object-cover"
                                />
                                {/* Overlay Photo (Newer / Selected) */}
                                <div className="absolute inset-0 transition-opacity duration-150" style={{ opacity: opacity / 100 }}>
                                    <Image
                                        src={selectedPhoto.url}
                                        alt="Overlay"
                                        fill
                                        className="object-cover"
                                    />
                                </div>

                                <div className="absolute top-4 left-4 bg-deep-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl text-[10px] text-blue-400 font-black uppercase tracking-widest border border-blue-500/30">
                                    Base: {format(parseISO(comparePhoto.date), 'dd/MM/yy')}
                                </div>
                                <div className="absolute top-4 right-4 bg-deep-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl text-[10px] text-acid-lime font-black uppercase tracking-widest border border-acid-lime/30" style={{ opacity: opacity / 100 }}>
                                    Atual: {format(parseISO(selectedPhoto.date), 'dd/MM/yy')}
                                </div>
                            </div>
                        ) : (
                            <div className="relative w-full max-w-md aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl border-2 border-white/10">
                                <Image
                                    src={selectedPhoto.url}
                                    alt="Selected"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        )}

                    </div>

                    {/* Controls */}
                    <div className="p-8 bg-surface-grey border-t border-white/10 pb-12">
                        {isCompareMode ? (
                            <div className="max-w-md mx-auto space-y-6">
                                <div className="flex justify-between text-[10px] text-zinc-500 font-black uppercase tracking-widest">
                                    <span>Antes</span>
                                    <span>Depois ({opacity}%)</span>
                                </div>
                                <div className="relative h-2 w-full bg-deep-black rounded-full overflow-hidden border border-white/5">
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={opacity}
                                        onChange={(e) => setOpacity(Number(e.target.value))}
                                        className="absolute inset-0 w-full h-2 appearance-none bg-transparent cursor-pointer accent-acid-lime z-10"
                                    />
                                    <div
                                        className="h-full bg-acid-lime shadow-[0_0_10px_rgba(189,255,0,0.5)] transition-all"
                                        style={{ width: `${opacity}%` }}
                                    />
                                </div>
                                <div className="flex justify-center">
                                    <button
                                        onClick={() => setIsCompareMode(false)}
                                        className="text-[10px] font-black text-zinc-500 hover:text-white uppercase tracking-widest transition-colors"
                                    >
                                        Sair da Comparação
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex justify-center">
                                <button
                                    onClick={handleCompare}
                                    className="flex items-center gap-3 px-8 py-4 bg-acid-lime text-black font-black uppercase tracking-widest text-xs rounded-2xl shadow-[0_0_20px_rgba(189,255,0,0.3)] hover:scale-105 active:scale-95 transition-all"
                                >
                                    <ArrowsLeftRight size={20} weight="bold" />
                                    Comparar Evolução
                                </button>
                            </div>
                        )}

                        {/* Mini Strip for selecting comparison if in compare mode */}
                        {isCompareMode && (
                            <div className="mt-8 flex gap-3 overflow-x-auto py-2 snap-x px-4">
                                {photos.filter(p => p.type === selectedPhoto.type && p.id !== selectedPhoto.id).map(p => (
                                    <button
                                        key={p.id}
                                        onClick={() => setComparePhoto(p)}
                                        className={`relative w-20 h-20 rounded-xl overflow-hidden border-4 flex-shrink-0 snap-center transition-all ${comparePhoto?.id === p.id ? 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'border-white/10 hover:border-white/30'}`}
                                    >
                                        <Image src={p.url} alt="thumb" fill className="object-cover" />
                                        <div className="absolute inset-x-0 bottom-0 bg-black/60 text-[8px] text-white font-bold p-1 text-center">
                                            {format(parseISO(p.date), 'dd/MM/yy')}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Ambient Glow */}
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-blue-500/5 blur-[50px] rounded-full pointer-events-none" />
        </div>
    );
}
