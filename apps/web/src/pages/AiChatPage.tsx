import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useThemeStore } from "@/store/themeStore";
import { getPalette, buildStyles } from "./dashboard/theme";
import { apiFetch } from "@/lib/api";
import { getSessionId } from "@/lib/session";
import type { AiQueryResponse, AiChatHistoryResponse } from "@repo/shared";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  data?: Array<Record<string, unknown>> | null;
}

const SUGGESTIONS = [
  "Which endpoint was called most often in the last 24 hours?",
  "How many 500 errors happened this week?",
  "What is the average response time for /api/sales?",
  "Show me the slowest endpoints",
];

let nextLocalId = 0;
function localId() {
  return `local-${nextLocalId++}`;
}

export default function AiChatPage() {
  const theme = useThemeStore((s) => s.theme);
  const palette = useMemo(() => getPalette(theme), [theme]);
  const s = useMemo(() => buildStyles(palette), [palette]);
  const sessionId = useMemo(() => getSessionId(), []);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [hydrating, setHydrating] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await apiFetch<AiChatHistoryResponse>(
          `/api/ai/history?sessionId=${sessionId}`,
        );
        if (res.messages.length > 0) {
          setMessages(
            res.messages.map((m) => ({
              id: m.id,
              role: m.role,
              text: m.content,
              data: m.data,
            })),
          );
        }
      } catch {
        /* history is non-critical */
      } finally {
        setHydrating(false);
      }
    }
    void loadHistory();
  }, [sessionId]);

  async function send(question: string) {
    if (!question.trim() || loading) return;

    const userMsg: ChatMessage = { id: localId(), role: "user", text: question.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await apiFetch<AiQueryResponse>("/api/ai/query", {
        method: "POST",
        body: JSON.stringify({ sessionId, question: question.trim() }),
      });

      const assistantMsg: ChatMessage = {
        id: localId(),
        role: "assistant",
        text: res.answer,
        data: res.data,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: localId(),
        role: "assistant",
        text: err instanceof Error ? err.message : "Something went wrong",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  const clearHistory = useCallback(async () => {
    try {
      await apiFetch(`/api/ai/history?sessionId=${sessionId}`, { method: "DELETE" });
      setMessages([]);
    } catch {
      /* best-effort */
    }
  }, [sessionId]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    void send(input);
  }

  const bubbleUser: React.CSSProperties = {
    background: "var(--bs-primary)",
    color: "#fff",
    borderRadius: "16px 16px 4px 16px",
    padding: "10px 16px",
    maxWidth: "75%",
    alignSelf: "flex-end",
    fontSize: "0.9rem",
    lineHeight: 1.5,
  };

  const bubbleAssistant: React.CSSProperties = {
    background: palette.card,
    border: `1px solid ${palette.border}`,
    color: palette.text,
    borderRadius: "16px 16px 16px 4px",
    padding: "10px 16px",
    maxWidth: "75%",
    alignSelf: "flex-start",
    fontSize: "0.9rem",
    lineHeight: 1.5,
  };

  if (hydrating) {
    return (
      <div style={{ ...s.page, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading…</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ ...s.page, display: "flex", flexDirection: "column", padding: 0 }}>
      <div style={{ padding: "20px 28px 0", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: "1.4rem", fontWeight: 600, marginBottom: 4 }}>AI Analytics Chat</h1>
          <p style={{ color: palette.muted, fontSize: "0.85rem", margin: 0 }}>
            Ask questions about your HTTP request logs in natural language
          </p>
        </div>
        {messages.length > 0 && (
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            style={{ fontSize: "0.8rem", whiteSpace: "nowrap", marginTop: 4 }}
            onClick={() => void clearHistory()}
          >
            Clear chat
          </button>
        )}
      </div>

      <div
        style={{
          flex: 1,
          overflow: "auto",
          padding: "20px 28px",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {messages.length === 0 && !loading && (
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
            }}
          >
            <div style={{ color: palette.muted, fontSize: "0.9rem", fontWeight: 500 }}>
              Try one of these questions:
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", maxWidth: 600 }}>
              {SUGGESTIONS.map((q) => (
                <button
                  key={q}
                  type="button"
                  className="btn btn-sm"
                  style={{
                    background: palette.card,
                    border: `1px solid ${palette.border}`,
                    color: palette.text,
                    borderRadius: 20,
                    fontSize: "0.82rem",
                    padding: "6px 14px",
                  }}
                  onClick={() => void send(q)}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} style={{ display: "flex", flexDirection: "column" }}>
            <div style={msg.role === "user" ? bubbleUser : bubbleAssistant}>
              {msg.text}
            </div>

            {msg.data && msg.data.length > 0 && (
              <div
                style={{
                  ...s.panel,
                  marginTop: 8,
                  alignSelf: "flex-start",
                  maxWidth: "85%",
                  overflow: "auto",
                }}
              >
                <table
                  className="table table-sm table-hover mb-0"
                  style={{ fontSize: "0.82rem" }}
                >
                  <thead>
                    <tr>
                      {Object.keys(msg.data[0]).map((key) => (
                        <th key={key} className="text-muted fw-semibold text-nowrap">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {msg.data.map((row, i) => (
                      <tr key={i}>
                        {Object.values(row).map((val, j) => (
                          <td key={j} className="text-nowrap">
                            {String(val)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div style={{ alignSelf: "flex-start", padding: "10px 16px" }}>
            <div className="spinner-border spinner-border-sm text-primary" role="status">
              <span className="visually-hidden">Thinking…</span>
            </div>
            <span style={{ color: palette.muted, fontSize: "0.85rem", marginLeft: 8 }}>
              Analyzing logs…
            </span>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        style={{
          padding: "16px 28px",
          borderTop: `1px solid ${palette.border}`,
          background: palette.card,
          display: "flex",
          gap: 10,
        }}
      >
        <input
          ref={inputRef}
          type="text"
          className="form-control"
          placeholder="Ask about your request logs…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          autoFocus
          style={{ fontSize: "0.9rem" }}
        />
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading || !input.trim()}
          style={{ whiteSpace: "nowrap" }}
        >
          Send
        </button>
      </form>
    </div>
  );
}
