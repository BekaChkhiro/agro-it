interface SEOScoreCardProps {
  score: number;
  label?: string;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: { width: 60, stroke: 4, fontSize: "text-sm" },
  md: { width: 90, stroke: 5, fontSize: "text-xl" },
  lg: { width: 120, stroke: 6, fontSize: "text-3xl" },
};

export function SEOScoreCard({ score, label = "SEO Score", size = "md" }: SEOScoreCardProps) {
  const { width, stroke, fontSize } = sizeMap[size];
  const radius = (width - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(100, score));
  const offset = circumference - (progress / 100) * circumference;

  const color =
    progress >= 80
      ? "text-green-500 stroke-green-500"
      : progress >= 50
        ? "text-yellow-500 stroke-yellow-500"
        : "text-red-500 stroke-red-500";

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width, height: width }}>
        <svg width={width} height={width} className="-rotate-90">
          <circle
            cx={width / 2}
            cy={width / 2}
            r={radius}
            fill="none"
            className="stroke-muted"
            strokeWidth={stroke}
          />
          <circle
            cx={width / 2}
            cy={width / 2}
            r={radius}
            fill="none"
            className={color}
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`font-bold ${fontSize} ${color.split(" ")[0]}`}>{progress}</span>
        </div>
      </div>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
    </div>
  );
}
