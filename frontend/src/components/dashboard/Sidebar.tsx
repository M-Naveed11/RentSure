"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, FileText, MessageSquare,
  ScrollText, Settings, Shield, Menu, X,
} from "lucide-react";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/analyses", label: "Analyses", icon: FileText },
  { href: "/chat", label: "AI Chat", icon: MessageSquare },
  { href: "/documents", label: "Documents", icon: ScrollText },
  { href: "/settings", label: "Settings", icon: Settings },
];

function NavLinks({ pathname, onClose }: { pathname: string; onClose?: () => void }) {
  return (
    <nav className="flex flex-col gap-1">
      {nav.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          onClick={onClose}
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
            pathname === href || pathname.startsWith(href + "/")
              ? "bg-blue-50 text-blue-700"
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          )}
        >
          <Icon className="h-4 w-4" />
          {label}
        </Link>
      ))}
    </nav>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-60 min-h-screen bg-white border-r px-4 py-6 flex-shrink-0">
        <Link href="/dashboard" className="flex items-center gap-2 mb-8 px-2">
          <Shield className="h-6 w-6 text-blue-600" />
          <span className="text-xl font-bold text-blue-600">RentSure</span>
        </Link>
        <NavLinks pathname={pathname} />
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b h-14 flex items-center justify-between px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-600" />
          <span className="text-lg font-bold text-blue-600">RentSure</span>
        </Link>
        <button onClick={() => setMobileOpen(true)} className="p-2 rounded-lg hover:bg-gray-100">
          <Menu className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside className={cn(
        "md:hidden fixed top-0 left-0 z-50 h-full w-64 bg-white border-r px-4 py-6 flex flex-col transition-transform duration-300",
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between mb-8 px-2">
          <Link href="/dashboard" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
            <Shield className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold text-blue-600">RentSure</span>
          </Link>
          <button onClick={() => setMobileOpen(false)} className="p-1 rounded hover:bg-gray-100">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        <NavLinks pathname={pathname} onClose={() => setMobileOpen(false)} />
      </aside>
    </>
  );
}
