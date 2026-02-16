'use client';

import { useState, useRef, useEffect } from "react";
import { Camera, ArrowsClockwise, Check } from "@phosphor-icons/react";

interface AssessmentCameraProps {
    onCapture: (imageSrc: string) => void;
    previousPhotoUrl?: string; // For ghost overlay
    label: string;
}

export default function AssessmentCamera({ onCapture, previousPhotoUrl, label }: AssessmentCameraProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isStreaming, setIsStreaming] = useState(false);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "environment" } // Prefer back camera
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                setIsStreaming(true);
            }
        } catch (err) {
            console.error(err);
            setError("Não foi possível acessar a câmera.");
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            setIsStreaming(false);
        }
    };

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');

            if (context) {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                setCapturedImage(dataUrl);
                onCapture(dataUrl);
                stopCamera();
            }
        }
    };

    const retake = () => {
        setCapturedImage(null);
        startCamera();
    };

    useEffect(() => {
        return () => {
            stopCamera();
        };
    }, []);

    return (
        <div className="bg-slate-900 rounded-3xl overflow-hidden relative aspect-[3/4] shadow-lg group">
            {!capturedImage ? (
                <>
                    {/* Ghost Overlay Layer */}
                    {previousPhotoUrl && isStreaming && (
                        <div
                            className="absolute inset-0 z-20 opacity-40 pointer-events-none bg-cover bg-center mix-blend-screen"
                            style={{ backgroundImage: `url(${previousPhotoUrl})` }}
                        />
                    )}

                    {/* Camera Layer */}
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="absolute inset-0 w-full h-full object-cover z-10"
                    />

                    {!isStreaming && !error && (
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-800 z-30">
                            <button
                                onClick={startCamera}
                                className="flex flex-col items-center gap-2 text-white hover:text-emerald-400 transition-colors"
                            >
                                <Camera size={48} weight="duotone" />
                                <span className="font-bold">Ativar Câmera</span>
                            </button>
                        </div>
                    )}

                    {error && (
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-800 z-30 text-white p-6 text-center">
                            <p>{error}</p>
                        </div>
                    )}

                    {/* Controls */}
                    {isStreaming && (
                        <div className="absolute bottom-6 left-0 right-0 z-40 flex justify-center">
                            <button
                                onClick={capturePhoto}
                                className="w-16 h-16 rounded-full border-4 border-white bg-white/20 backdrop-blur-sm hover:bg-white/40 transition-all active:scale-95"
                            />
                        </div>
                    )}
                </>
            ) : (
                <div className="relative w-full h-full">
                    <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
                    <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-4">
                        <button
                            onClick={retake}
                            className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-rose-500 transition-colors"
                        >
                            <ArrowsClockwise size={24} weight="bold" />
                        </button>
                        <div className="p-3 bg-emerald-500 rounded-full text-white">
                            <Check size={24} weight="bold" />
                        </div>
                    </div>
                </div>
            )}

            <canvas ref={canvasRef} className="hidden" />

            {/* Label */}
            <div className="absolute top-4 left-4 z-50 bg-black/50 backdrop-blur-md px-3 py-1 rounded-lg">
                <span className="text-white text-xs font-bold uppercase tracking-wider">{label}</span>
            </div>
        </div>
    );
}
