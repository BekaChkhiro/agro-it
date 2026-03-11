import { memo, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Sprout } from "lucide-react";

interface RouteTransitionOverlayProps {
  active: boolean;
}

const RouteTransitionOverlay = ({ active }: RouteTransitionOverlayProps) => {
  const [showSpinner, setShowSpinner] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (active) {
      // Show spinner after 800ms if still loading
      timeout = setTimeout(() => setShowSpinner(true), 800);
    } else {
      setShowSpinner(false);
    }

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [active]);

  return (
    <>
      {/* Top loading bar */}
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none fixed left-0 top-0 z-[80] h-1 w-full origin-left bg-gradient-to-r from-primary via-primary-light to-primary-dark",
          "shadow-[0_0_20px_rgba(0,0,0,0.12)] transition-all duration-300 ease-out",
          active ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"
        )}
      />

      {/* Small themed loading badge in top-right corner - appears after 800ms */}
      {showSpinner && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed top-4 right-4 z-[75] flex items-center justify-center"
        >
          <div className="flex items-center gap-3 rounded-full border border-primary/20 bg-background/95 px-3 py-2 shadow-lg backdrop-blur-sm">
            <span className="relative flex h-8 w-8 items-center justify-center">
              <span className="absolute inset-0 animate-spin rounded-full border-2 border-primary/10 border-t-primary/70" />
              <span className="absolute inset-1 animate-pulse rounded-full bg-primary/10" />
              <Sprout className="relative h-4 w-4 text-primary" />
            </span>
            <span className="text-xs font-medium text-foreground/70">Preparing equipment…</span>
          </div>
        </div>
      )}
    </>
  );
};

export default memo(RouteTransitionOverlay);
