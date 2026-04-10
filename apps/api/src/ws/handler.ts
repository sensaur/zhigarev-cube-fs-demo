import type { WebSocketServer, WebSocket } from "ws";
import { prisma } from "../lib/prisma.js";
import { logger } from "../lib/logger.js";
import { sessionManager, type Session } from "../services/sessionManager.js";
import { startLiveFeed } from "../services/liveSalesService.js";

function send(socket: WebSocket, data: unknown) {
  if (socket.readyState === 1) socket.send(JSON.stringify(data));
}

function broadcast(wss: WebSocketServer, data: unknown) {
  const json = JSON.stringify(data);
  for (const client of wss.clients) {
    if (client.readyState === 1) client.send(json);
  }
}

interface SocketState {
  sessionId: string | null;
  sessionVersion: number;
  stopFeed: (() => void) | null;
}

const DEFAULT_COUNTRY_COUNT = 5;
const DEFAULT_RECORD_COUNT = 50;

export function setupWebSocket(wss: WebSocketServer) {
  const socketStates = new Map<WebSocket, SocketState>();

  function startFeedForSocket(socket: WebSocket, session: Session) {
    const state = socketStates.get(socket);
    if (!state) return;

    state.stopFeed?.();
    state.sessionId = session.id;
    state.sessionVersion = session.version;

    const snapshot = sessionManager.getLiveSnapshot(session);
    send(socket, { type: "sales:snapshot", payload: snapshot });
    send(socket, { type: "session:ready", payload: { countries: session.countries } });

    state.stopFeed = startLiveFeed(session.countries, (record, liveSale) => {
      sessionManager.addLiveSale(session, record);
      send(socket, { type: "sale:live", payload: liveSale });
    });
  }

  wss.on("connection", (socket: WebSocket) => {
    socketStates.set(socket, { sessionId: null, sessionVersion: 0, stopFeed: null });

    send(socket, { type: "connected", payload: { ok: true } });

    socket.on("message", async (raw) => {
      try {
        const data = JSON.parse(String(raw));

        if (data?.type === "session:join" && typeof data?.payload?.sessionId === "string") {
          const sid = data.payload.sessionId;
          let session = sessionManager.get(sid);
          if (!session) {
            session = sessionManager.getOrCreate(sid, DEFAULT_COUNTRY_COUNT, DEFAULT_RECORD_COUNT);
          }
          startFeedForSocket(socket, session);
          return;
        }

        if (data?.type === "session:update") {
          const state = socketStates.get(socket);
          if (state?.sessionId) {
            const refreshed = sessionManager.get(state.sessionId);
            if (refreshed && refreshed.version !== state.sessionVersion) {
              startFeedForSocket(socket, refreshed);
            }
          }
          return;
        }

        if (data?.type === "message:create" && typeof data?.payload?.text === "string") {
          const saved = await prisma.message.create({
            data: { text: data.payload.text },
          });
          broadcast(wss, { type: "message:created", payload: saved });
        }
      } catch (error) {
        logger.error({ err: error }, "Invalid WS payload");
        send(socket, { type: "error", payload: { message: "Invalid payload" } });
      }
    });

    socket.on("close", () => {
      const state = socketStates.get(socket);
      state?.stopFeed?.();
      socketStates.delete(socket);
    });
  });
}
