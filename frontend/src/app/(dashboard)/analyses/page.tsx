"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import TopBar from "@/components/dashboard/TopBar";
import UploadZone from "@/components/dashboard/UploadZone";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, ChevronRight, AlertCircle } from "lucide-react";
import type { Analysis } from "@/types";

function scoreBadge(score?: number) {
  if (!score) return <Badge variant="secondary">Pending</Badge>;
  if (score >= 80) return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">{score}/100</Badge>;
  if (score >= 60) return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">{score}/100</Badge>;
  return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">{score}/100</Badge>;
}

function statusBadge(status: string) {
  if (status === "COMPLETED") return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Completed</Badge>;
  if (status === "PROCESSING") return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Processing</Badge>;
  return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Failed</Badge>;
}

export default function AnalysesPage() {
  const router = useRouter();
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/analyses").then((r) => setAnalyses(r.data)).finally(() => setLoading(false));
  }, []);

  async function handleFile(file: File) {
    setUploading(true);
    setError("");
    try {
      const form = new FormData();
      form.append("file", file);
      const { data: uploaded } = await api.post("/analyses/upload", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const { data: analyzed } = await api.post(`/analyses/analyze/${uploaded.id}`);
      router.push(`/analyses/${analyzed.id}`);
    } catch (e: any) {
      setError(e.response?.data?.detail || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <>
      <TopBar title="Lease Analyses" />
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">

          <UploadZone onFile={handleFile} loading={uploading} />

          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <div>
            <h2 className="text-sm font-semibold text-gray-700 mb-3">
              {loading ? "Loading…" : `${analyses.length} Analyse${analyses.length !== 1 ? "s" : ""}`}
            </h2>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
              </div>
            ) : analyses.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <FileText className="h-10 w-10 text-gray-300 mb-3" />
                  <p className="text-sm font-medium text-gray-600">No analyses yet</p>
                  <p className="text-xs text-gray-400 mt-1">Upload your first lease above to get started</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {analyses.map((a) => (
                  <Card
                    key={a.id}
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => router.push(`/analyses/${a.id}`)}
                  >
                    <CardContent className="flex items-center gap-4 py-4">
                      <FileText className="h-8 w-8 text-blue-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{a.file_name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {a.emirate && `${a.emirate} · `}
                          {new Date(a.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {a.status === "COMPLETED" ? scoreBadge(a.overall_score) : statusBadge(a.status)}
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
