import { useState, useRef, useEffect, useMemo } from "react";
import { useThemeStore } from "@/store/themeStore";
import { getPalette, buildStyles } from "./dashboard/theme";
import { apiFetch } from "@/lib/api";
import type { AiQueryResponse } from "@repo/shared";

interface ChatMessage {
  id: number;
  role: "user" | "assistant";
  text: string;
  data?: Array<Record<string, unknown>>;
}

const SUGGESTIONS = [
  "Which endpoint was called most often in the last 24 hours?",
  "How many 500 errors happened this week?",
  "What is the average response time for /api/sales?",
  "Show me the slowest endpoints",
];

let nextId = 0;

export default function AiChatPage() {
  const theme = useThemeStore((s) => s.theme);
  const palette = useMemo(() => getPalette(theme), [theme]);
  const s = useMemo(() => buildStyles(palette), [palette]);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(question: string) {
    if (!question.trim() || loading) return;

    const userMsg: ChatMessage = { id: nextId++, role: "user", text: question.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await apiFetch<AiQueryResponse>("/api/ai/query", {
        method: "POST",
        body: JSON.stringify({ question: question.trim() }),
      });

      const assistantMsg: ChatMessage = {
        id: nextId++,
        role: "assistant",
        text: res.answer,
        data: res.data,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: nextId++,
        role: "assistant",
        text: err instanceof Error ? err.message : "Something went wrong",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

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

  return (
    <div style={{ ...s.page, display: "flex", flexDirection: "column", padding: 0 }}>
      <div style={{ padding: "20px 28px 0" }}>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 600, marginBottom: 4 }}>AI Analytics Chat</h1>
        <p style={{ color: palette.muted, fontSize: "0.85rem", margin: 0 }}>
          Ask questions about your HTTP request logs in natural language
        </p>
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
