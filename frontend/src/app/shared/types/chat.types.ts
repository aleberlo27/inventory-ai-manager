export type ChatRole = 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: Date;
  productLink?: ProductLink;
}

export interface ProductLink {
  label: string;
  warehouseId: string;
  productId?: string;
}

export interface ChatRequest {
  message: string;
  conversationHistory: Array<{ role: ChatRole; content: string }>;
}

export interface ChatResponse {
  reply: string;
  productLink?: ProductLink;
}
