import type { LiveSale, LiveSalesSnapshot } from "./liveSales.js";
import type { Country } from "./sales.js";

export type WsClientEvent =
  | { type: "message:create"; payload: { text: string } }
  | { type: "session:join"; payload: { sessionId: string } }
  | { type: "session:update" };

export type WsServerEvent =
  | { type: "connected"; payload: { ok: boolean } }
  | { type: "message:created"; payload: { id: string; text: string; createdAt: string } }
  | { type: "sale:live"; payload: LiveSale }
  | { type: "sales:snapshot"; payload: LiveSalesSnapshot }
  | { type: "session:ready"; payload: { countries: Country[] } }
  | { type: "error"; payload: { message: string } };
