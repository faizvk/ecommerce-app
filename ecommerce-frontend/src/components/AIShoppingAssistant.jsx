import { useState, useEffect, useRef, useCallback, memo } from "react";
import { useSelector } from "react-redux";
import { useLocation, Link } from "react-router-dom";
import { Sparkles, X, Send, RefreshCcw, Bot, User as UserIcon } from "lucide-react";
import { sendChatMessage } from "../api/ai.api";

const STORAGE_KEY = "nexkart_ai_chat_v1";
const MAX_INPUT_CHARS = 800;

// Routes where the floating assistant should NOT render — admin has its own
// shell, and the auth pages are intentionally minimal.
const HIDDEN_PATH_PREFIXES = ["/admin", "/login", "/signup", "/forgot-password", "/reset-password"];

const GREETING = {
  role: "assistant",
  content:
    "Hi! I'm your NexKart shopping assistant. Ask me to find products, compare options, or help with anything else. What are you looking for today?",
};

/**
 * Parses [product:<id>] tokens out of an assistant message and returns an
 * array of segments — strings interleaved with { type: "product", id }
 * markers. The component renders product markers as inline pill links.
 */
function parseMessage(text) {
  const re = /\[product:([a-f0-9]{6,32})\]/gi;
  const segments = [];
  let lastIndex = 0;
  let match;
  while ((match = re.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: "text", value: text.slice(lastIndex, match.index) });
    }
    segments.push({ type: "product", id: match[1] });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    segments.push({ type: "text", value: text.slice(lastIndex) });
  }
  return segments;
}

const ProductPill = memo(function ProductPill({ id }) {
  return (
    <Link
      to={`/product/${id}`}
      className="inline-flex items-center gap-1 mx-0.5 my-0.5 px-2 py-0.5 rounded-md bg-brand-light text-brand text-[0.72rem] font-bold border border-brand/20 hover:bg-brand hover:text-white transition"
    >
      <Sparkles size={11} /> View
    </Link>
  );
});

function MessageBubble({ msg }) {
  const isUser = msg.role === "user";
  const segments = isUser ? [{ type: "text", value: msg.content }] : parseMessage(msg.content);

  return (
    <div className={`flex gap-2 ${isUser ? "flex-row-reverse" : ""}`}>
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
          isUser ? "bg-brand text-white" : "bg-gradient-to-br from-brand to-violet-500 text-white"
        }`}
      >
        {isUser ? <UserIcon size={14} /> : <Bot size={14} />}
      </div>
      <div
        className={`max-w-[78%] px-3 py-2 rounded-2xl text-[0.85rem] leading-snug ${
          isUser
            ? "bg-brand text-white rounded-tr-sm"
            : "bg-gray-50 text-gray-800 border border-gray-100 rounded-tl-sm"
        }`}
      >
        {segments.map((seg, i) =>
          seg.type === "product" ? (
            <ProductPill key={i} id={seg.id} />
          ) : (
            <span key={i} className="whitespace-pre-wrap">
              {seg.value}
            </span>
          )
        )}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-2">
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand to-violet-500 text-white flex items-center justify-center flex-shrink-0">
        <Bot size={14} />
      </div>
      <div className="bg-gray-50 border border-gray-100 px-4 py-3 rounded-2xl rounded-tl-sm flex gap-1">
        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>
    </div>
  );
}

export default function AIShoppingAssistant() {
  const { user, loading: authLoading } = useSelector((s) => s.auth);
  const location = useLocation();

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const parsed = stored ? JSON.parse(stored) : null;
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch {
      /* ignore parse errors */
    }
    return [GREETING];
  });
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);

  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  // Persist conversation locally so it survives reloads
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-30)));
    } catch {
      /* quota — silently drop */
    }
  }, [messages]);

  // Auto-scroll on new message or panel open
  useEffect(() => {
    if (open && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open, pending]);

  // Focus input on open
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 80);
  }, [open]);

  // Clear chat when user logs out so the next user doesn't see stale history
  useEffect(() => {
    if (!authLoading && !user) {
      setMessages([GREETING]);
      setOpen(false);
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        /* ignore */
      }
    }
  }, [authLoading, user]);

  const send = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || pending) return;

    const userMsg = { role: "user", content: trimmed };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setPending(true);
    setError(null);

    try {
      // Send only role+content fields the backend cares about
      const payload = next.map((m) => ({ role: m.role, content: m.content }));
      const res = await sendChatMessage(payload);
      const reply = res.data?.data?.reply || "Sorry, I couldn't generate a response.";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      const msg =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        "Something went wrong. Please try again.";
      setError(msg);
    } finally {
      setPending(false);
    }
  }, [input, pending, messages]);

  const reset = useCallback(() => {
    setMessages([GREETING]);
    setError(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  // Hide on auth/admin routes or while not logged in
  const onHiddenRoute = HIDDEN_PATH_PREFIXES.some((p) => location.pathname.startsWith(p));
  if (onHiddenRoute || authLoading || !user) return null;

  return (
    <>
      {/* Floating launcher */}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open shopping assistant"
          className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-brand to-violet-600 text-white shadow-hover flex items-center justify-center hover:scale-105 active:scale-95 transition"
        >
          <Sparkles size={22} />
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-white animate-pulse" />
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div
          className="fixed z-50 inset-x-3 bottom-3 sm:inset-auto sm:bottom-5 sm:right-5 sm:w-[380px] sm:h-[560px] bg-white rounded-2xl shadow-hover border border-gray-100 flex flex-col overflow-hidden"
          role="dialog"
          aria-label="NexKart shopping assistant"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-brand to-violet-600 text-white px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/15 backdrop-blur flex items-center justify-center">
              <Sparkles size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-[0.95rem] leading-tight">Shopping Assistant</p>
              <p className="text-[0.7rem] text-white/80 leading-tight flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-300 rounded-full" /> Online · powered by AI
              </p>
            </div>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset conversation"
              title="Start over"
              className="w-8 h-8 rounded-lg hover:bg-white/15 flex items-center justify-center transition"
            >
              <RefreshCcw size={15} />
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close assistant"
              className="w-8 h-8 rounded-lg hover:bg-white/15 flex items-center justify-center transition"
            >
              <X size={17} />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-4 space-y-3 bg-white">
            {messages.map((m, i) => (
              <MessageBubble key={i} msg={m} />
            ))}
            {pending && <TypingIndicator />}
            {error && (
              <div className="text-[0.8rem] text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                {error}
              </div>
            )}
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="border-t border-gray-100 p-3 bg-white"
          >
            <div className="flex gap-2 items-end">
              <textarea
                ref={inputRef}
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value.slice(0, MAX_INPUT_CHARS))}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                placeholder="Ask anything about products..."
                disabled={pending}
                className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-[0.85rem] resize-none focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand max-h-24"
              />
              <button
                type="submit"
                disabled={pending || !input.trim()}
                aria-label="Send message"
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand to-violet-600 text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95 transition flex-shrink-0"
              >
                <Send size={16} />
              </button>
            </div>
            <p className="text-[0.65rem] text-gray-400 mt-1.5 px-1">
              {input.length}/{MAX_INPUT_CHARS} · Enter to send · Shift+Enter for newline
            </p>
          </form>
        </div>
      )}
    </>
  );
}
