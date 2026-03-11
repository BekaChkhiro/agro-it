"use client";

import { createContext, useContext, useEffect, useMemo, useState, useCallback, type ReactNode } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import RouteTransitionOverlay from "@/components/RouteTransitionOverlay";

interface RouteTransitionContextValue {
  hold: () => void;
  release: () => void;
  isActive: boolean;
}

const RouteTransitionContext = createContext<RouteTransitionContextValue | undefined>(undefined);

export const RouteTransitionProvider = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [manualHolds, setManualHolds] = useState(0);
  const [autoActive, setAutoActive] = useState(false);

  useEffect(() => {
    setAutoActive(true);
    const timeout = window.setTimeout(() => setAutoActive(false), 450);
    return () => window.clearTimeout(timeout);
  }, [pathname, searchParams?.toString()]);

  const hold = useCallback(() => setManualHolds((count) => count + 1), []);
  const release = useCallback(() => setManualHolds((count) => Math.max(0, count - 1)), []);

  const isActive = autoActive || manualHolds > 0;

  const value = useMemo<RouteTransitionContextValue>(() => ({ hold, release, isActive }), [hold, release, isActive]);

  return (
    <RouteTransitionContext.Provider value={value}>
      {children}
      <RouteTransitionOverlay active={isActive} />
    </RouteTransitionContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useRouteTransition = () => {
  const context = useContext(RouteTransitionContext);
  if (!context) {
    throw new Error("useRouteTransition must be used within a RouteTransitionProvider");
  }
  return context;
};
