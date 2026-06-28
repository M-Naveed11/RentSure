"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import api from "@/lib/api";
import TopBar from "@/components/dashboard/TopBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2, MessageSquare, Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/types";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "ar", label: "العربية" },
  { code: "ur", label: "اردو" },
  { code: "hi", label: "हिंदी" },
];

export default function ChatPage() {
  const searchParams = useSearchParams();
  const analysisId = searchParams.get("analysis") ?? undefined;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [language, setLanguage] = useState("en");
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.get("/chat/history")
      .then((r) => setMessages(r.data))
      .finally(() => setHistoryLoading(false));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function handleSend() {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "USER",
      content: text,
      language,
      created_at: new Date().toISOString(),
    };
    setMessages((m) => [...m, userMsg]);
    setLoading(true);

    try {
      const { data } = await api.post("/chat/message", {
        content: text,
        language,
        analysis_id: analysisId,
      });
      setMessages((m) => [...m, data]);
    } catch (e: any) {
      const errMsg: ChatMessage = {
        id: Date.now().toString() + "_err",
        role: "ASSISTANT",
        content: e.response?.data?.detail || "Something went wrong. Please try again.",
        language,
        created_at: new Date().toISOString(),
      };
      setMessages((m) => [...m, errMsg]);
    } finally {
      setLoading(false);
    }
  }

  const isRtl = language === "ar" || language === "ur";

  return (
    <>
      <TopBar title="AI Chat" />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Language selector */}
        <div className="border-b bg-white px-4 py-2 flex items-center gap-2">
          <span className="text-xs text-gray-500">Language:</span>
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => setLanguage(l.code)}
              className={cn(
                "text-xs px-3 py-1 rounded-full border transition-colors",
                language === l.code
                  ? "bg-blue-600 text-white border-blue-600"
                  : "border-gray-300 text-gray-600 hover:border-blue-400"
              )}
            >
              {l.label}
            </button>
          ))}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {historyLoading ? (
            <div className="flex justify-center pt-10">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-16">
              <div className="h-14 w-14 rounded-full bg-blue-50 flex items-center justify-center mb-3">
                <MessageSquare className="h-6 w-6 text-blue-500" />
              </div>
              <p className="text-sm font-semibold text-gray-700 mb-1">UAE Tenant Rights Assistant</p>
              <p className="text-xs text-gray-500 max-w-xs">
                Ask about rent increases, eviction rules, deposit refunds, RERA, RDSC, or your specific lease.
              </p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={cn("flex gap-2", msg.role === "USER" ? "justify-end" : "justify-start")}
              >
                {msg.role === "ASSISTANT" && (
                  <div className="h-7 w-7 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="h-4 w-4 text-blue-600" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap",
                    msg.role === "USER"
                      ? "bg-blue-600 text-white rounded-br-sm"
                      : "bg-gray-100 text-gray-800 rounded-bl-sm",
                    isRtl && "text-right"
                  )}
                  dir={isRtl ? "rtl" : "ltr"}
                >
                  {msg.content}
                </div>
                {msg.role === "USER" && (
                  <div className="h-7 w-7 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 mt-1">
                    <User className="h-4 w-4 text-gray-600" />
                  </div>
                )}
              </div>
            ))
          )}

          {loading && (
            <div className="flex gap-2 justify-start">
              <div className="h-7 w-7 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-1">
                <Bot className="h-4 w-4 text-blue-600" />
              </div>
              <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="border-t bg-white p-4">
          <form
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your lease or UAE tenant rights…"
              disabled={loading}
              dir={isRtl ? "rtl" : "ltr"}
              className="flex-1"
            />
            <Button type="submit" disabled={!input.trim() || loading} size="icon">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
          <p className="text-xs text-gray-400 mt-1 text-center">
            General information only — not legal advice
          </p>
        </div>
      </div>
    </>
  );
}
