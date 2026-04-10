export interface AiQueryRequest {
  question: string;
}

export interface AiQueryResponse {
  answer: string;
  data?: Array<Record<string, unknown>>;
}
