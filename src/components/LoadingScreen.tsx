import { useEffect } from "react";
import { useRouteTransition } from "@/contexts/RouteTransitionContext";

const LoadingScreen = () => {
  const { hold, release } = useRouteTransition();

  useEffect(() => {
    hold();
    return () => release();
  }, [hold, release]);

  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 py-24">
      <span className="relative flex h-16 w-16 items-center justify-center">
        <span className="absolute inset-0 animate-ping rounded-full bg-primary/10" />
        <span className="absolute inset-2 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
        <span className="h-4 w-4 rounded-full bg-primary" />
      </span>
      <p className="text-base font-semibold text-foreground/80" aria-live="assertive">
        Loading the next module…
      </p>
    </div>
  );
};

export default LoadingScreen;
