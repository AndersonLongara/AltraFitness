"use client";

import { X, Play, Pause, FastForward } from "@phosphor-icons/react";
import { useEffect, useState } from "react";

interface RestTimerProps {
    initialSeconds: number;
    onComplete: () => void;
    onClose: () => void;
}

export default function RestTimer({ initialSeconds, onComplete, onClose }: RestTimerProps) {
    const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
    const [isRunning, setIsRunning] = useState(true);

    useEffect(() => {
        if (!isRunning) return;

        if (secondsLeft <= 0) {
            onComplete();
            return;
        }

        const interval = setInterval(() => {
            setSecondsLeft((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [secondsLeft, isRunning, onComplete]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const progress = ((initialSeconds - secondsLeft) / initialSeconds) * 100;

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4 bg-graphite-dark/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-pure-white w-full max-w-sm rounded-3xl soft-shadow overflow-hidden flex flex-col items-center p-8 relative">

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-slate-300 hover:text-slate-500 rounded-full hover:bg-slate-100 transition-colors"
                >
                    <X size={24} weight="bold" />
                </button>

                <h3 className="text-slate-400 font-bold uppercase tracking-widest text-sm mb-6">Descanso</h3>

                {/* Circular Progress / Timer Display */}
                <div className="relative w-48 h-48 flex items-center justify-center mb-8">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle
                            cx="96"
                            cy="96"
                            r="88"
                            stroke="currentColor"
                            strokeWidth="12"
                            fill="transparent"
                            className="text-slate-100"
                        />
                        <circle
                            cx="96"
                            cy="96"
                            r="88"
                            stroke="currentColor"
                            strokeWidth="12"
                            fill="transparent"
                            strokeDasharray={2 * Math.PI * 88}
                            strokeDashoffset={2 * Math.PI * 88 * (1 - (secondsLeft / initialSeconds))}
                            strokeLinecap="round"
                            className="text-performance-green transition-all duration-1000 ease-linear"
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-5xl font-extrabold text-graphite-dark tabular-nums">
                            {formatTime(secondsLeft)}
                        </span>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-4 w-full justify-center">
                    <button
                        onClick={() => setSecondsLeft(prev => prev + 30)}
                        className="px-4 py-2 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors text-sm"
                    >
                        +30s
                    </button>

                    <button
                        onClick={() => setIsRunning(!isRunning)}
                        className="w-14 h-14 bg-performance-green text-graphite-dark rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200 hover:scale-105 active:scale-95 transition-all"
                    >
                        {isRunning ? <Pause size={24} weight="fill" /> : <Play size={24} weight="fill" />}
                    </button>

                    <button
                        onClick={onComplete}
                        className="px-4 py-2 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors text-sm flex items-center gap-2"
                    >
                        Pular <FastForward size={16} weight="fill" />
                    </button>
                </div>

            </div>
        </div>
    );
}
