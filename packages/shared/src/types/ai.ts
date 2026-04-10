export interface AiQueryRequest {
  sessionId: string;
  question: string;
}

export interface AiQueryResponse {
  answer: string;
  data?: Array<Record<string, unknown>>;
}

export interface AiChatMessage {
  id: string;
  sessionId: string;
  role: "user" | "assistant";
  content: string;
  data?: Array<Record<string, unknown>> | null;
  createdAt: string;
}

export interface AiChatHistoryResponse {
  messages: AiChatMessage[];
}
