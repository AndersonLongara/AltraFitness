"use client";

import { createContext, useContext, useMemo } from "react";

type SubscriptionLimits = {
    hasSalesAccess: boolean;
};

const SubscriptionNavContext = createContext<SubscriptionLimits | null>(null);

export function SubscriptionNavProvider({
    children,
    hasSalesAccess,
}: {
    children: React.ReactNode;
    hasSalesAccess: boolean;
}) {
    const value = useMemo(() => ({ hasSalesAccess }), [hasSalesAccess]);
    return (
        <SubscriptionNavContext.Provider value={value}>
            {children}
        </SubscriptionNavContext.Provider>
    );
}

export function useSubscriptionNav(): SubscriptionLimits {
    const ctx = useContext(SubscriptionNavContext);
    if (!ctx) {
        return { hasSalesAccess: true };
    }
    return ctx;
}
