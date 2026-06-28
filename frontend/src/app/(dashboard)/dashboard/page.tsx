"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import TopBar from "@/components/dashboard/TopBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, MessageSquare, ScrollText, Shield, ChevronRight } from "lucide-react";
import type { Analysis, UsageInfo } from "@/types";

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const firstName = session?.user?.name?.split(" ")[0] || "there";

  const [recentAnalyses, setRecentAnalyses] = useState<Analysis[]>([]);
  const [usage, setUsage] = useState<UsageInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/analyses").then((r) => setRecentAnalyses(r.data.slice(0, 3))),
      api.get("/users/usage").then((r) => setUsage(r.data)),
    ]).finally(() => setLoading(false));
  }, []);

  return (
    <>
      <TopBar title="Dashboard" />
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">

          {/* Welcome banner */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
            <h2 className="text-2xl font-bold mb-1">Welcome back, {firstName}!</h2>
            <p className="text-blue-100 text-sm">
              Upload your lease and let AI protect your rights under UAE Law.
            </p>
            <Button
              className="mt-4 bg-white text-blue-700 hover:bg-blue-50"
              onClick={() => router.push("/analyses")}
            >
              Analyze a Lease
            </Button>
          </div>

          {/* Usage stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {loading ? (
              [1, 2, 3].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)
            ) : (
              <>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Analyses</CardTitle>
                    <FileText className="h-4 w-4 text-blue-500" />
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{usage?.analyses_this_month ?? 0}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      of {usage?.analyses_limit === 999 ? "Unlimited" : usage?.analyses_limit} this month
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Chats Today</CardTitle>
                    <MessageSquare className="h-4 w-4 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{usage?.chats_today ?? 0}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      of {usage?.chats_limit === 999 ? "Unlimited" : usage?.chats_limit} today
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Plan</CardTitle>
                    <ScrollText className="h-4 w-4 text-purple-500" />
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold capitalize">{usage?.plan?.toLowerCase() ?? "Free"}</p>
                    {usage?.plan === "FREE" && (
                      <button
                        className="text-xs text-blue-600 hover:underline mt-1"
                        onClick={() => router.push("/settings")}
                      >
                        Upgrade to Premium →
                      </button>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Recent analyses */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700">Recent Analyses</h3>
              <button className="text-xs text-blue-600 hover:underline" onClick={() => router.push("/analyses")}>
                View all
              </button>
            </div>
            {loading ? (
              <Skeleton className="h-32 w-full rounded-xl" />
            ) : recentAnalyses.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <FileText className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No analyses yet — upload your first lease</p>
                  <Button size="sm" className="mt-3" onClick={() => router.push("/analyses")}>
                    Upload Lease
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {recentAnalyses.map((a) => (
                  <Card
                    key={a.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => router.push(`/analyses/${a.id}`)}
                  >
                    <CardContent className="flex items-center gap-3 py-3">
                      <FileText className="h-6 w-6 text-blue-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{a.file_name}</p>
                        <p className="text-xs text-gray-400">{new Date(a.created_at).toLocaleDateString()}</p>
                      </div>
                      {a.overall_score !== undefined && a.overall_score !== null && (
                        <Badge className={
                          a.overall_score >= 80 ? "bg-green-100 text-green-700 hover:bg-green-100" :
                          a.overall_score >= 60 ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-100" :
                          "bg-red-100 text-red-700 hover:bg-red-100"
                        }>
                          {a.overall_score}/100
                        </Badge>
                      )}
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Button variant="outline" className="justify-start gap-2" onClick={() => router.push("/analyses")}>
              <FileText className="h-4 w-4 text-blue-500" /> Upload Lease
            </Button>
            <Button variant="outline" className="justify-start gap-2" onClick={() => router.push("/chat")}>
              <MessageSquare className="h-4 w-4 text-green-500" /> Ask AI
            </Button>
            <Button variant="outline" className="justify-start gap-2" onClick={() => router.push("/documents")}>
              <ScrollText className="h-4 w-4 text-purple-500" /> Write Letter
            </Button>
          </div>

          {/* Rights tip */}
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="py-4">
              <div className="flex gap-2">
                <Shield className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-800 mb-1">Know Your Rights</p>
                  <p className="text-sm text-amber-700">
                    Under UAE Law No. 26/2007, your landlord must give <strong>90 days written notice</strong> before any rent increase, and increases must comply with the RERA Smart Rental Index.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
