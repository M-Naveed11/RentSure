"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import TopBar from "@/components/dashboard/TopBar";
import ScoreCircle from "@/components/dashboard/ScoreCircle";
import FlagCard from "@/components/dashboard/FlagCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, AlertCircle, AlertTriangle, CheckCircle, TrendingUp, Home } from "lucide-react";
import type { Analysis } from "@/types";

const VERDICT_LABELS: Record<string, { label: string; color: string }> = {
  well_below_market: { label: "Well Below Market", color: "bg-green-100 text-green-700" },
  below_market: { label: "Below Market", color: "bg-green-100 text-green-700" },
  fair: { label: "Fair Market Rent", color: "bg-blue-100 text-blue-700" },
  above_market: { label: "Above Market", color: "bg-yellow-100 text-yellow-700" },
  overpriced: { label: "Overpriced", color: "bg-red-100 text-red-700" },
};

export default function AnalysisDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/analyses/${id}`).then((r) => setAnalysis(r.data)).finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <>
        <TopBar title="Analysis Result" />
        <div className="flex-1 p-6">
          <div className="max-w-4xl mx-auto space-y-4">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
          </div>
        </div>
      </>
    );
  }

  if (!analysis) {
    return (
      <>
        <TopBar title="Analysis Result" />
        <div className="flex-1 p-6 flex items-center justify-center">
          <p className="text-gray-500">Analysis not found.</p>
        </div>
      </>
    );
  }

  const verdict = analysis.rent_verdict ? VERDICT_LABELS[analysis.rent_verdict] : null;

  return (
    <>
      <TopBar title="Analysis Result" />
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto space-y-5">

          <Button variant="ghost" size="sm" className="gap-1 -ml-2" onClick={() => router.push("/analyses")}>
            <ArrowLeft className="h-4 w-4" /> Back to Analyses
          </Button>

          {/* Header card */}
          <Card>
            <CardContent className="flex flex-col sm:flex-row items-center gap-6 py-6">
              {analysis.overall_score !== undefined && analysis.overall_score !== null && (
                <ScoreCircle score={analysis.overall_score} />
              )}
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-lg font-bold text-gray-900 mb-1">{analysis.file_name}</h2>
                <div className="flex flex-wrap gap-2 justify-center sm:justify-start mb-3">
                  {analysis.emirate && (
                    <Badge variant="secondary">
                      <Home className="h-3 w-3 mr-1" /> {analysis.emirate}
                    </Badge>
                  )}
                  {analysis.property_type && <Badge variant="secondary">{analysis.property_type}</Badge>}
                  {analysis.annual_rent && (
                    <Badge variant="secondary">
                      AED {analysis.annual_rent.toLocaleString()}/year
                    </Badge>
                  )}
                </div>
                {analysis.summary && (
                  <p className="text-sm text-gray-600 leading-relaxed">{analysis.summary}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Rent comparison */}
          {verdict && analysis.fair_rent_min && analysis.fair_rent_max && (
            <Card className="border-blue-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                  Rent Comparison (RERA Smart Index)
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col sm:flex-row items-center gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">
                    AED {analysis.annual_rent?.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">Your rent</p>
                </div>
                <div className="text-center flex-1">
                  <span className={`text-sm font-semibold px-3 py-1 rounded-full ${verdict.color}`}>
                    {verdict.label}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">
                    Fair range: AED {analysis.fair_rent_min?.toLocaleString()} – {analysis.fair_rent_max?.toLocaleString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Red flags */}
          {analysis.red_flags && analysis.red_flags.length > 0 && (
            <div>
              <h3 className="flex items-center gap-2 text-sm font-bold text-red-700 mb-2">
                <AlertCircle className="h-4 w-4" />
                Red Flags ({analysis.red_flags.length}) — Action Required
              </h3>
              <div className="space-y-2">
                {analysis.red_flags.map((flag: any, i: number) => (
                  <FlagCard key={i} type="red" item={flag} index={i} />
                ))}
              </div>
            </div>
          )}

          {/* Yellow flags */}
          {analysis.yellow_flags && analysis.yellow_flags.length > 0 && (
            <div>
              <h3 className="flex items-center gap-2 text-sm font-bold text-yellow-700 mb-2">
                <AlertTriangle className="h-4 w-4" />
                Yellow Flags ({analysis.yellow_flags.length}) — Review Carefully
              </h3>
              <div className="space-y-2">
                {analysis.yellow_flags.map((flag: any, i: number) => (
                  <FlagCard key={i} type="yellow" item={flag} index={i} />
                ))}
              </div>
            </div>
          )}

          {/* Green flags */}
          {analysis.green_flags && analysis.green_flags.length > 0 && (
            <div>
              <h3 className="flex items-center gap-2 text-sm font-bold text-green-700 mb-2">
                <CheckCircle className="h-4 w-4" />
                Green Flags ({analysis.green_flags.length}) — Tenant Friendly
              </h3>
              <div className="space-y-2">
                {analysis.green_flags.map((flag: any, i: number) => (
                  <FlagCard key={i} type="green" item={flag} index={i} />
                ))}
              </div>
            </div>
          )}

          {/* Chat CTA */}
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-sm text-blue-700 font-medium">
                Have questions about this lease? Ask the AI assistant.
              </p>
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 flex-shrink-0"
                onClick={() => router.push(`/chat?analysis=${id}`)}
              >
                Ask AI
              </Button>
            </CardContent>
          </Card>

        </div>
      </div>
    </>
  );
}
