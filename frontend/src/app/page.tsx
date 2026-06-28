import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Shield, FileText, MessageSquare, ScrollText,
  CheckCircle2, AlertCircle, TrendingUp, Globe, ChevronDown,
} from "lucide-react";

export default async function RootPage() {
  const session = await getServerSession(authOptions);
  if (session) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-white">

      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold text-blue-600">RentSure</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login"><Button variant="ghost" size="sm">Sign in</Button></Link>
            <Link href="/register"><Button size="sm" className="bg-blue-600 hover:bg-blue-700">Get Started Free</Button></Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-b from-blue-50 to-white pt-20 pb-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="mb-4 bg-blue-100 text-blue-700 hover:bg-blue-100">Powered by Claude AI</Badge>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight mb-5">
            Know Your Rights Before<br />You Sign Your Lease
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            RentSure analyzes UAE lease agreements in seconds — spotting illegal clauses,
            unfair terms, and RERA violations so you never sign a bad contract again.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/register">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 px-8">Analyze My Lease — Free</Button>
            </Link>
            <Link href="#how-it-works">
              <Button variant="outline" size="lg" className="px-8">See How It Works</Button>
            </Link>
          </div>
          <p className="text-xs text-gray-400 mt-4">No credit card required · 1 free analysis per month</p>
        </div>

        {/* Mock result card */}
        <div className="max-w-md mx-auto mt-14">
          <div className="bg-white rounded-2xl shadow-xl border p-6">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="h-6 w-6 text-blue-500" />
              <div>
                <p className="text-sm font-semibold text-gray-800">Dubai_Lease_2024.pdf</p>
                <p className="text-xs text-gray-400">Dubai · Apartment · AED 85,000/year</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full border-4 border-yellow-400 flex items-center justify-center flex-shrink-0">
                <span className="text-xl font-bold text-yellow-600">58</span>
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 rounded-lg px-3 py-1.5">
                  <AlertCircle className="h-3.5 w-3.5" /> Rent increase violates RERA rules
                </div>
                <div className="flex items-center gap-2 text-xs text-yellow-700 bg-yellow-50 rounded-lg px-3 py-1.5">
                  <AlertCircle className="h-3.5 w-3.5" /> Deposit exceeds 5% legal limit
                </div>
                <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 rounded-lg px-3 py-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Ejari registration clause present
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-blue-600 py-8 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 text-center text-white">
          {[
            { value: "UAE Law", label: "26/2007 & 33/2008" },
            { value: "RERA", label: "Smart Rental Index" },
            { value: "4 Languages", label: "EN · AR · UR · HI" },
            { value: "RDSC", label: "Complaint Templates" },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-xl font-bold">{s.value}</p>
              <p className="text-blue-200 text-xs mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4" id="features">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-3">Everything you need to rent safely</h2>
          <p className="text-center text-gray-500 mb-12">Built for UAE tenants — expats and nationals alike.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: FileText, color: "text-blue-500 bg-blue-50", title: "AI Lease Analysis", desc: "Upload your PDF and get a report with red, yellow, and green flags — each referenced to specific UAE laws." },
              { icon: TrendingUp, color: "text-green-500 bg-green-50", title: "Rent Comparison", desc: "Compare your rent against the RERA Smart Rental Index to know if you're being overcharged." },
              { icon: MessageSquare, color: "text-purple-500 bg-purple-50", title: "Multilingual AI Chat", desc: "Ask questions in English, Arabic, Urdu, or Hindi. Get answers citing specific UAE law articles." },
              { icon: ScrollText, color: "text-orange-500 bg-orange-50", title: "Document Generator", desc: "Generate rent reduction requests, deposit refund demands, RDSC complaints, and more." },
              { icon: Globe, color: "text-red-500 bg-red-50", title: "4 Languages", desc: "Full support for English, Arabic (RTL), Urdu, and Hindi — covering all UAE expat communities." },
              { icon: Shield, color: "text-blue-500 bg-blue-50", title: "Know Your Rights", desc: "Instant access to UAE tenant protection laws, Ejari rules, and RDSC filing procedures." },
            ].map(({ icon: Icon, color, title, desc }) => (
              <div key={title} className="bg-white border rounded-xl p-5 hover:shadow-md transition-shadow">
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center mb-3 ${color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-50 py-20 px-4" id="how-it-works">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">How it works</h2>
          <div className="space-y-6">
            {[
              { step: "1", title: "Upload your lease PDF", desc: "Drag and drop your lease — Ejari, RERA standard, or any UAE format." },
              { step: "2", title: "AI analyzes in 30 seconds", desc: "Claude AI reads every clause against UAE Law 26/2007, RERA rules, and Ejari requirements." },
              { step: "3", title: "Get your report", desc: "See your lease score (0–100), red flags with law references, and actionable recommendations." },
              { step: "4", title: "Take action", desc: "Chat with AI for advice, generate legal letters, or file with RDSC." },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex gap-4">
                <div className="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold flex-shrink-0 text-sm">
                  {step}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{title}</h3>
                  <p className="text-sm text-gray-500 mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-4" id="pricing">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-3">Simple, transparent pricing</h2>
          <p className="text-center text-gray-500 mb-12">Start free. Upgrade when you need more.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <div className="border rounded-xl p-6 bg-white">
              <h3 className="font-bold text-gray-900 mb-1">Free</h3>
              <p className="text-3xl font-extrabold text-gray-900 mb-1">AED 0</p>
              <p className="text-xs text-gray-400 mb-5">Forever free</p>
              <div className="space-y-2 mb-6">
                {["1 lease analysis/month", "5 AI chats/day", "View analysis report", "English only"].map((f) => (
                  <div key={f} className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle2 className="h-4 w-4 text-green-500" /> {f}
                  </div>
                ))}
              </div>
              <Link href="/register"><Button variant="outline" className="w-full">Get Started Free</Button></Link>
            </div>
            <div className="border-2 border-blue-500 rounded-xl p-6 bg-blue-50 relative">
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white">Most Popular</Badge>
              <h3 className="font-bold text-gray-900 mb-1">Premium</h3>
              <p className="text-3xl font-extrabold text-gray-900 mb-1">
                AED 29<span className="text-base font-normal text-gray-500">/mo</span>
              </p>
              <p className="text-xs text-gray-400 mb-5">or AED 199 lifetime</p>
              <div className="space-y-2 mb-6">
                {["Unlimited lease analyses", "Unlimited AI chat", "6 document templates", "4 languages (EN/AR/UR/HI)", "PDF downloads", "Priority support"].map((f) => (
                  <div key={f} className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle2 className="h-4 w-4 text-blue-600" /> {f}
                  </div>
                ))}
              </div>
              <Link href="/register"><Button className="w-full bg-blue-600 hover:bg-blue-700">Start Premium Trial</Button></Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-gray-50 py-20 px-4" id="faq">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Frequently asked questions</h2>
          <div className="space-y-4">
            {[
              { q: "Which emirates does RentSure cover?", a: "All 7 UAE emirates. Our analysis is based on federal UAE law (Law No. 26/2007) which applies UAE-wide, plus Dubai-specific RERA regulations." },
              { q: "Is this legal advice?", a: "No. RentSure provides general legal information. For specific disputes, consult a licensed UAE lawyer or file with RDSC." },
              { q: "What languages are supported?", a: "English, Arabic (with RTL support), Urdu, and Hindi — covering the majority of UAE's expat community." },
              { q: "How accurate is the AI analysis?", a: "RentSure uses Claude AI trained on UAE law and RERA rules. It identifies common issues accurately but should complement professional advice for complex disputes." },
              { q: "Can I get a refund?", a: "Yes — if you're not satisfied within 7 days of your first payment, we'll refund in full. No questions asked." },
            ].map(({ q, a }) => (
              <details key={q} className="bg-white border rounded-xl px-5 py-4 cursor-pointer group">
                <summary className="flex items-center justify-between font-medium text-gray-900 text-sm list-none">
                  {q}
                  <ChevronDown className="h-4 w-4 text-gray-400 group-open:rotate-180 transition-transform flex-shrink-0 ml-3" />
                </summary>
                <p className="mt-3 text-sm text-gray-500 leading-relaxed">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-blue-600 text-white text-center">
        <h2 className="text-3xl font-bold mb-3">Protect your tenancy rights today</h2>
        <p className="text-blue-200 mb-8 max-w-md mx-auto">
          Join UAE tenants who use RentSure to understand their leases and fight unfair treatment.
        </p>
        <Link href="/register">
          <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50 px-10">
            Get Started — It&apos;s Free
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-10 px-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-400" />
            <span className="text-white font-bold">RentSure</span>
            <span className="text-xs ml-1">— AI Lease Analyzer for UAE Tenants</span>
          </div>
          <div className="flex gap-6 text-sm">
            <Link href="/login" className="hover:text-white transition-colors">Sign in</Link>
            <Link href="/register" className="hover:text-white transition-colors">Register</Link>
            <Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link>
          </div>
          <p className="text-xs">© {new Date().getFullYear()} RentSure. Not legal advice.</p>
        </div>
      </footer>

    </div>
  );
}
