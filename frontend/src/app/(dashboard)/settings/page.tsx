"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import api from "@/lib/api";
import TopBar from "@/components/dashboard/TopBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, CheckCircle2 } from "lucide-react";
import type { User, UsageInfo } from "@/types";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "ar", label: "العربية" },
  { code: "ur", label: "اردو" },
  { code: "hi", label: "हिंदी" },
];

export default function SettingsPage() {
  const { data: session } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [usage, setUsage] = useState<UsageInfo | null>(null);
  const [name, setName] = useState("");
  const [language, setLanguage] = useState("en");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([api.get("/users/me"), api.get("/users/usage")]).then(([u, usg]) => {
      setUser(u.data);
      setUsage(usg.data);
      setName(u.data.name);
      setLanguage(u.data.preferred_language);
    });
  }, []);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      await api.patch("/users/me", { name, preferred_language: language });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  }

  async function handleCheckout(plan: string) {
    setCheckoutLoading(plan);
    try {
      const { data } = await api.post("/payments/checkout", { plan });
      window.location.href = data.checkout_url;
    } catch {
      setCheckoutLoading(null);
    }
  }

  async function handlePortal() {
    try {
      const { data } = await api.get("/payments/portal");
      window.location.href = data.portal_url;
    } catch {}
  }

  const isPremium = user?.plan === "PREMIUM";

  return (
    <>
      <TopBar title="Settings" />
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-2xl mx-auto space-y-5">

          {/* Profile */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={session?.user?.email || ""} disabled className="bg-gray-50" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Preferred Language</Label>
                <div className="flex gap-2 flex-wrap">
                  {LANGUAGES.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => setLanguage(l.code)}
                      className={`text-sm px-4 py-1.5 rounded-full border transition-colors ${
                        language === l.code
                          ? "bg-blue-600 text-white border-blue-600"
                          : "border-gray-300 text-gray-600 hover:border-blue-400"
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>
              <Button onClick={handleSave} disabled={saving} className="gap-2">
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : saved ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : null}
                {saved ? "Saved!" : "Save Changes"}
              </Button>
            </CardContent>
          </Card>

          {/* Usage */}
          {usage && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Usage This Month</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Analyses</span>
                  <span className="font-medium">
                    {usage.analyses_this_month} / {usage.analyses_limit === 999 ? "Unlimited" : usage.analyses_limit}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Chats today</span>
                  <span className="font-medium">
                    {usage.chats_today} / {usage.chats_limit === 999 ? "Unlimited" : usage.chats_limit}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Billing */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Subscription</CardTitle>
                <Badge className={isPremium ? "bg-blue-100 text-blue-700" : ""}>{isPremium ? "Premium" : "Free"}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {isPremium ? (
                <>
                  <p className="text-sm text-gray-600">
                    You have unlimited analyses, chats, and document generation.
                  </p>
                  <Button variant="outline" onClick={handlePortal}>Manage Billing</Button>
                </>
              ) : (
                <>
                  <div className="rounded-lg bg-gray-50 p-4 space-y-1">
                    <p className="text-sm font-semibold text-gray-800">Premium includes:</p>
                    {["Unlimited lease analyses", "Unlimited AI chat", "6 document templates", "Multi-language support", "PDF downloads"].map((f) => (
                      <p key={f} className="text-sm text-gray-600 flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> {f}
                      </p>
                    ))}
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      onClick={() => handleCheckout("monthly")}
                      disabled={!!checkoutLoading}
                    >
                      {checkoutLoading === "monthly" ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                      Monthly — AED 29/month
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => handleCheckout("lifetime")}
                      disabled={!!checkoutLoading}
                    >
                      {checkoutLoading === "lifetime" ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                      Lifetime — AED 199 one-time
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </>
  );
}
