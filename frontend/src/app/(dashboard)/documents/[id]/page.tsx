"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import TopBar from "@/components/dashboard/TopBar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Download, Copy, CheckCheck } from "lucide-react";
import type { GeneratedDocument } from "@/types";

export default function DocumentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [doc, setDoc] = useState<GeneratedDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api.get(`/documents/${id}`).then((r) => setDoc(r.data)).finally(() => setLoading(false));
  }, [id]);

  async function copyToClipboard() {
    if (!doc) return;
    await navigator.clipboard.writeText(doc.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function downloadPdf() {
    const res = await api.get(`/documents/${id}/pdf`, { responseType: "blob" });
    const url = URL.createObjectURL(res.data);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${doc?.title || "document"}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <>
        <TopBar title="Document" />
        <div className="flex-1 p-6">
          <div className="max-w-3xl mx-auto space-y-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full rounded-lg" />)}
          </div>
        </div>
      </>
    );
  }

  if (!doc) {
    return (
      <>
        <TopBar title="Document" />
        <div className="flex-1 p-6 flex items-center justify-center">
          <p className="text-gray-500">Document not found.</p>
        </div>
      </>
    );
  }

  const isRtl = doc.language === "ar" || doc.language === "ur";

  return (
    <>
      <TopBar title={doc.title} />
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" className="gap-1 -ml-2" onClick={() => router.push("/documents")}>
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-1" onClick={copyToClipboard}>
                {copied ? <CheckCheck className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied!" : "Copy"}
              </Button>
              <Button size="sm" className="gap-1" onClick={downloadPdf}>
                <Download className="h-4 w-4" /> Download PDF
              </Button>
            </div>
          </div>

          <div
            className="bg-white border rounded-xl p-8 shadow-sm font-mono text-sm leading-relaxed whitespace-pre-wrap text-gray-800"
            dir={isRtl ? "rtl" : "ltr"}
          >
            {doc.content}
          </div>
        </div>
      </div>
    </>
  );
}
