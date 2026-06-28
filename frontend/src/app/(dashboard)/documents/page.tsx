"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import TopBar from "@/components/dashboard/TopBar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ScrollText, ArrowLeft, Lock } from "lucide-react";

const TEMPLATES = [
  {
    type: "rent_reduction",
    label: "Rent Reduction Request",
    desc: "Challenge a rent increase using the RERA Smart Rental Index.",
    fields: [
      { key: "tenant_name", label: "Your Full Name" },
      { key: "landlord_name", label: "Landlord / Agent Name" },
      { key: "property_address", label: "Property Address" },
      { key: "current_rent", label: "Current Annual Rent (AED)" },
      { key: "requested_rent", label: "Requested Annual Rent (AED)" },
      { key: "reason", label: "Reason (RERA index, market rates, etc.)" },
    ],
  },
  {
    type: "deposit_refund",
    label: "Security Deposit Refund Demand",
    desc: "Formally demand the return of your security deposit.",
    fields: [
      { key: "tenant_name", label: "Your Full Name" },
      { key: "landlord_name", label: "Landlord / Agent Name" },
      { key: "property_address", label: "Property Address" },
      { key: "deposit_amount", label: "Deposit Amount (AED)" },
      { key: "move_out_date", label: "Move-Out Date" },
      { key: "disputed_deductions", label: "Disputed Deductions (if any)" },
    ],
  },
  {
    type: "maintenance_complaint",
    label: "Maintenance Complaint",
    desc: "Request landlord to fix maintenance issues in writing.",
    fields: [
      { key: "tenant_name", label: "Your Full Name" },
      { key: "landlord_name", label: "Landlord / Agent Name" },
      { key: "property_address", label: "Property Address" },
      { key: "issues", label: "Issues (AC, plumbing, electric, etc.)" },
      { key: "dates_reported", label: "Dates Previously Reported" },
    ],
  },
  {
    type: "notice_to_vacate",
    label: "Notice to Vacate",
    desc: "Formally notify your landlord you are moving out.",
    fields: [
      { key: "tenant_name", label: "Your Full Name" },
      { key: "landlord_name", label: "Landlord / Agent Name" },
      { key: "property_address", label: "Property Address" },
      { key: "move_out_date", label: "Intended Move-Out Date" },
      { key: "contract_end_date", label: "Contract End Date" },
    ],
  },
  {
    type: "counter_eviction",
    label: "Counter-Eviction Response",
    desc: "Challenge an illegal or improper eviction notice.",
    fields: [
      { key: "tenant_name", label: "Your Full Name" },
      { key: "landlord_name", label: "Landlord / Agent Name" },
      { key: "property_address", label: "Property Address" },
      { key: "eviction_reason", label: "Stated Eviction Reason" },
      { key: "notice_date", label: "Notice Date" },
      { key: "your_counter", label: "Your Counter Argument" },
    ],
  },
  {
    type: "rdsc_complaint",
    label: "RDSC Complaint Letter",
    desc: "File a complaint with the Rental Disputes Settlement Centre.",
    fields: [
      { key: "complainant_name", label: "Your Full Name" },
      { key: "respondent_name", label: "Landlord / Agent Name" },
      { key: "property_address", label: "Property Address" },
      { key: "dispute_type", label: "Type of Dispute" },
      { key: "dispute_details", label: "Full Details of Dispute" },
      { key: "amount_claimed", label: "Amount Claimed (AED, if any)" },
    ],
  },
];

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "ar", label: "العربية" },
  { code: "ur", label: "اردو" },
  { code: "hi", label: "हिंदी" },
];

export default function DocumentsPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<(typeof TEMPLATES)[0] | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [language, setLanguage] = useState("en");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  function openTemplate(t: (typeof TEMPLATES)[0]) {
    setSelected(t);
    setForm({});
    setError("");
  }

  async function handleGenerate() {
    if (!selected) return;
    setGenerating(true);
    setError("");
    try {
      const { data } = await api.post("/documents/generate", {
        type: selected.type,
        language,
        input_data: form,
      });
      router.push(`/documents/${data.id}`);
    } catch (e: any) {
      setError(e.response?.data?.detail || "Generation failed. Please upgrade to Premium.");
    } finally {
      setGenerating(false);
    }
  }

  if (selected) {
    return (
      <>
        <TopBar title={selected.label} />
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-2xl mx-auto space-y-5">
            <Button variant="ghost" size="sm" className="gap-1 -ml-2" onClick={() => setSelected(null)}>
              <ArrowLeft className="h-4 w-4" /> Back to Templates
            </Button>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">{selected.label}</CardTitle>
                <CardDescription>{selected.desc}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-2">Document Language</p>
                  <div className="flex gap-2 flex-wrap">
                    {LANGUAGES.map((l) => (
                      <button
                        key={l.code}
                        onClick={() => setLanguage(l.code)}
                        className={`text-xs px-3 py-1 rounded-full border transition-colors ${
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

                {selected.fields.map((f) => (
                  <div key={f.key} className="space-y-1">
                    <Label htmlFor={f.key}>{f.label}</Label>
                    <Input
                      id={f.key}
                      value={form[f.key] || ""}
                      onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
                      placeholder={f.label}
                    />
                  </div>
                ))}

                {error && <p className="text-sm text-red-500">{error}</p>}

                <Button
                  className="w-full"
                  onClick={handleGenerate}
                  disabled={generating}
                >
                  {generating ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating…</>
                  ) : (
                    <><ScrollText className="h-4 w-4 mr-2" /> Generate Letter</>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <TopBar title="Document Generator" />
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto space-y-4">
          <p className="text-sm text-gray-500">
            Generate professional legal letters in English, Arabic, Urdu, or Hindi. <Badge variant="secondary" className="text-xs ml-1">Premium</Badge>
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {TEMPLATES.map((t) => (
              <Card key={t.type} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => openTemplate(t)}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold">{t.label}</CardTitle>
                    <Lock className="h-3.5 w-3.5 text-gray-400" />
                  </div>
                  <CardDescription className="text-xs">{t.desc}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" size="sm" className="w-full pointer-events-none">
                    <ScrollText className="h-3 w-3 mr-2" /> Select Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="py-4 text-center">
              <p className="text-sm text-blue-700 font-medium mb-2">
                Premium required — AED 29/month or AED 199 lifetime
              </p>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => router.push("/settings")}>
                Upgrade to Premium
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
