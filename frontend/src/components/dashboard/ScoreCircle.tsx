"use client";

interface ScoreCircleProps {
  score: number;
  size?: number;
}

function getColor(score: number) {
  if (score >= 80) return "#16a34a";
  if (score >= 60) return "#ca8a04";
  if (score >= 40) return "#ea580c";
  return "#dc2626";
}

function getLabel(score: number) {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Average";
  if (score >= 20) return "Poor";
  return "Dangerous";
}

export default function ScoreCircle({ score, size = 140 }: ScoreCircleProps) {
  const r = (size - 16) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (score / 100) * circumference;
  const color = getColor(score);

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e5e7eb" strokeWidth={10} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={10}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
        <text
          x={size / 2}
          y={size / 2 - 6}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={size / 4}
          fontWeight="700"
          fill={color}
        >
          {score}
        </text>
        <text
          x={size / 2}
          y={size / 2 + size / 6}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={size / 10}
          fill="#6b7280"
        >
          / 100
        </text>
      </svg>
      <span className="text-sm font-semibold" style={{ color }}>{getLabel(score)}</span>
    </div>
  );
}
