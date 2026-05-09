import { useEffect, useMemo, useRef, useState } from "react";
import { getChatHistory, sendChatMessage } from "../../../core/api/chat-api";
import { PLAN_NUDGES } from "../../../core/plan/nudges";

const QUICK_PROMPTS = [
  "Give me a 60-second summary I can speak.",
  "What are the top 3 weaknesses to mention?",
  "Ask me 5 viva questions and answer them.",
  "Draft a strong opening and closing statement.",
];

function formatTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

export function WorkspaceChatPanel({ workspaceId, workspaceReady, chatAllowed, onUsageSync }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef(null);

  useEffect(() => {
    if (!workspaceId) return undefined;
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const result = await getChatHistory(workspaceId, { page: 1, limit: 50 });
        if (!cancelled) setMessages(Array.isArray(result?.items) ? result.items : []);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Unable to load chat history.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [workspaceId]);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, sending]);

  const canSend = useMemo(() => {
    const text = draft.trim();
    return workspaceReady && chatAllowed && text.length > 0 && text.length <= 4000 && !sending;
  }, [workspaceReady, chatAllowed, draft, sending]);

  async function onSubmit(e) {
    e.preventDefault();
    const text = draft.trim();
    if (!text || text.length > 4000 || !workspaceId || !canSend) return;
    setSending(true);
    setError("");
    const userMsg = {
      messageId: `local-user-${Date.now()}`,
      role: "user",
      content: text,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setDraft("");
    try {
      const reply = await sendChatMessage({ workspaceId, message: text });
      const assistant = {
        messageId: `local-assistant-${Date.now()}`,
        role: "assistant",
        content: reply?.content || "No reply received.",
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistant]);
      if (typeof onUsageSync === "function") await onUsageSync();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Message send failed.";
      setError(msg);
      setMessages((prev) => prev.filter((m) => m.messageId !== userMsg.messageId));
    } finally {
      setSending(false);
    }
  }

  function onComposerKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (canSend) {
        void onSubmit(e);
      }
    }
  }

  function applyPrompt(prompt) {
    if (!workspaceReady || !chatAllowed || sending) return;
    setDraft(prompt);
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_14px_30px_rgba(15,23,42,0.08)]">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-white px-3 py-3 sm:gap-3 sm:px-4 md:px-5">
        <div className="inline-flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-blue-200 bg-blue-50 text-[10px] font-black text-blue-700">
            AI
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-900">Study Chat</p>
            <p className="text-[11px] text-slate-500">Realtime workspace assistant</p>
          </div>
        </div>
        {!workspaceReady ? (
          <span className="rounded-full border border-amber-300 bg-amber-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
            Waiting
          </span>
        ) : (
          <span className="rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
            Online
          </span>
        )}
      </header>

      <div ref={listRef} className="max-h-[28rem] space-y-3 overflow-y-auto bg-gradient-to-b from-slate-50/60 to-white px-3 py-4 sm:px-4 md:px-5">
        <div className="flex items-center gap-2 pb-1">
          <div className="h-px flex-1 bg-slate-200" />
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Conversation</p>
          <div className="h-px flex-1 bg-slate-200" />
        </div>
        {loading ? (
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
            Loading conversation...
          </div>
        ) : null}

        {!loading && messages.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-xs leading-relaxed text-slate-500">
            No messages yet. Start with a quick prompt above, or ask anything about methods, results, limitations, or Q&A strategy.
          </div>
        ) : null}

        {messages.map((m) => {
          const isUser = m.role === "user";
          return (
            <article
              key={m.messageId || `${m.role}-${m.createdAt}-${m.content?.slice(0, 16)}`}
              className={`flex gap-2 ${isUser ? "justify-end" : "justify-start"}`}
            >
              {!isUser ? <span className="mt-1 hidden h-7 w-7 shrink-0 items-center justify-center rounded-full border border-blue-200 bg-blue-50 text-[10px] font-black text-blue-700 sm:inline-flex">AI</span> : null}
              <div
                className={`relative max-w-[92%] rounded-2xl border px-3 py-2.5 sm:max-w-[85%] ${
                  isUser
                    ? "border-blue-200 bg-blue-50 text-slate-900"
                    : "border-slate-200 bg-white text-slate-700 shadow-[0_4px_14px_rgba(15,23,42,0.05)]"
                }`}
              >
                <span
                  className={`pointer-events-none absolute top-3 h-2.5 w-2.5 rotate-45 border ${
                    isUser
                      ? "-right-1.5 border-l-0 border-b-0 border-blue-200 bg-blue-50"
                      : "-left-1.5 border-r-0 border-t-0 border-slate-200 bg-white"
                  }`}
                  aria-hidden
                />
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{m.content}</p>
                <p className="mt-1 text-right text-[10px] opacity-55">{formatTime(m.createdAt)}</p>
              </div>
              {isUser ? <span className="mt-1 hidden h-7 w-7 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-[10px] font-black text-slate-500 sm:inline-flex">You</span> : null}
            </article>
          );
        })}

        {sending ? (
          <article className="flex justify-start gap-2">
            <span className="mt-1 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-blue-200 bg-blue-50 text-[10px] font-black text-blue-700">
              AI
            </span>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
              <div className="inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-arxio-primary-container" />
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-arxio-primary-container [animation-delay:120ms]" />
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-arxio-primary-container [animation-delay:240ms]" />
              </div>
            </div>
          </article>
        ) : null}
      </div>

      <div className="border-t border-slate-200 bg-slate-50/50 px-3 py-2 sm:px-4 md:px-5">
        <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
          {QUICK_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => applyPrompt(prompt)}
              disabled={!workspaceReady || !chatAllowed || sending}
              className="shrink-0 rounded-full border border-slate-300 bg-white px-2.5 py-1 text-[10px] font-semibold text-slate-600 transition hover:border-arxio-primary-container/45 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      <form className="border-t border-slate-200 bg-white px-3 py-3 sm:px-4 md:px-5" onSubmit={onSubmit}>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onComposerKeyDown}
          placeholder="Ask a focused question... (Enter to send, Shift+Enter for newline)"
          maxLength={4000}
          disabled={!workspaceReady || !chatAllowed || sending}
          className="min-h-24 w-full resize-y rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-arxio-primary-container focus:outline-none"
        />
        <div className="mt-2 flex items-center justify-between gap-2">
          <p className="text-[10px] text-slate-500">{draft.trim().length}/4000</p>
          <button
            type="submit"
            disabled={!canSend}
            className="rounded-full bg-gradient-to-br from-arxio-primary-container to-arxio-inverse-primary px-4 py-2 text-[10px] font-semibold uppercase tracking-widest text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {sending ? "Sending..." : "Send"}
          </button>
        </div>
      </form>

      {!chatAllowed ? (
        <p className="mx-4 mb-4 mt-3 rounded-md border border-amber-300 bg-amber-50 px-2.5 py-2 text-xs text-amber-700 md:mx-5">
          {PLAN_NUDGES.chat_limit}
        </p>
      ) : null}
      {error ? (
        <p className="mx-4 mb-4 mt-3 rounded-md border border-rose-300 bg-rose-50 px-2.5 py-2 text-xs text-rose-700 md:mx-5">
          {error}
        </p>
      ) : null}
    </section>
  );
}
