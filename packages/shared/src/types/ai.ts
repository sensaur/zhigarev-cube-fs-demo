export interface AiConversation {
  id: string;
  sessionId: string;
  title: string;
  createdAt: string;
  archivedAt?: string | null;
}

export interface AiChatMessage {
  id: string;
  conversationId: string;
  role: "user" | "assistant";
  content: string;
  data?: Array<Record<string, unknown>> | null;
  createdAt: string;
}

export interface AiQueryRequest {
  conversationId: string;
  question: string;
}

export interface AiQueryResponse {
  answer: string;
  data?: Array<Record<string, unknown>>;
}

export interface AiConversationsListResponse {
  conversations: AiConversation[];
}

export interface AiChatHistoryResponse {
  messages: AiChatMessage[];
}
