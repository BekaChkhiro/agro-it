import { Globe } from "lucide-react";

interface SERPPreviewProps {
  title: string;
  url: string;
  description: string;
  favicon?: string;
}

function CharCounter({ current, min, max, label }: { current: number; min: number; max: number; label: string }) {
  const color = current === 0
    ? "text-muted-foreground"
    : current < min
      ? "text-yellow-600 dark:text-yellow-400"
      : current > max
        ? "text-red-600 dark:text-red-400"
        : "text-green-600 dark:text-green-400";

  return (
    <span className={`text-xs ${color}`}>
      {label}: {current}/{max}
    </span>
  );
}

export function SERPPreview({ title, url, description, favicon }: SERPPreviewProps) {
  const displayTitle = title.length > 60 ? title.substring(0, 57) + "..." : title;
  const displayDesc = description.length > 160 ? description.substring(0, 157) + "..." : description;

  return (
    <div className="space-y-3">
      <div className="rounded-lg border bg-white p-4 dark:bg-slate-950">
        <p className="mb-1 text-xs text-muted-foreground">Google Preview</p>
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {favicon ? (
              <img src={favicon} alt="" className="h-4 w-4 rounded-full" />
            ) : (
              <Globe className="h-4 w-4" />
            )}
            <span className="truncate">{url || "https://agroit.ge"}</span>
          </div>
          <h3 className="text-lg font-normal leading-tight text-blue-700 dark:text-blue-400">
            {displayTitle || "Page Title"}
          </h3>
          <p className="text-sm leading-snug text-slate-600 dark:text-slate-400">
            {displayDesc || "Meta description will appear here..."}
          </p>
        </div>
      </div>
      <div className="flex gap-4">
        <CharCounter current={title.length} min={30} max={60} label="Title" />
        <CharCounter current={description.length} min={120} max={160} label="Description" />
      </div>
    </div>
  );
}
