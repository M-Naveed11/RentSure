"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, AlertCircle, AlertTriangle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type FlagType = "red" | "yellow" | "green";

interface RedYellowFlag {
  clause: string;
  issue: string;
  law_reference?: string;
  recommendation: string;
}

interface GreenFlag {
  clause: string;
  positive: string;
}

interface FlagCardProps {
  type: FlagType;
  item: RedYellowFlag | GreenFlag;
  index: number;
}

const config = {
  red: {
    bg: "bg-red-50 border-red-200",
    header: "text-red-800",
    badge: "bg-red-100 text-red-700",
    icon: AlertCircle,
    iconColor: "text-red-500",
  },
  yellow: {
    bg: "bg-yellow-50 border-yellow-200",
    header: "text-yellow-800",
    badge: "bg-yellow-100 text-yellow-700",
    icon: AlertTriangle,
    iconColor: "text-yellow-500",
  },
  green: {
    bg: "bg-green-50 border-green-200",
    header: "text-green-800",
    badge: "bg-green-100 text-green-700",
    icon: CheckCircle,
    iconColor: "text-green-500",
  },
};

export default function FlagCard({ type, item, index }: FlagCardProps) {
  const [open, setOpen] = useState(index === 0);
  const c = config[type];
  const Icon = c.icon;
  const isGreen = type === "green";
  const flag = item as any;

  return (
    <div className={cn("border rounded-lg overflow-hidden", c.bg)}>
      <button
        className="w-full flex items-center gap-3 px-4 py-3 text-left"
        onClick={() => setOpen((o) => !o)}
      >
        <Icon className={cn("h-4 w-4 flex-shrink-0", c.iconColor)} />
        <span className={cn("text-sm font-medium flex-1 line-clamp-1", c.header)}>
          {flag.clause}
        </span>
        {open ? (
          <ChevronUp className="h-4 w-4 text-gray-400 flex-shrink-0" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />
        )}
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-2 border-t border-opacity-30">
          {isGreen ? (
            <p className="text-sm text-green-700 mt-3">{flag.positive}</p>
          ) : (
            <>
              <div className="mt-3">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Issue</p>
                <p className="text-sm text-gray-700">{flag.issue}</p>
              </div>
              {flag.law_reference && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Law Reference</p>
                  <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", c.badge)}>
                    {flag.law_reference}
                  </span>
                </div>
              )}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Recommendation</p>
                <p className="text-sm text-gray-700">{flag.recommendation}</p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
