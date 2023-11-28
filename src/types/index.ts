export type Role = 'user' | 'assistant' | 'system';
export type AudioState = 'loading' | 'playing' | 'done';
export type Message = {
  id: string;
  sessionId: string;
  role: Role;
  content: string;
  audioKey?: number;
  audioState?: AudioState;
};
export type ToObj<T extends object> = {
  [P in keyof T]: T[P];
};
export type MessageAndIndex = ToObj<Message & { index?: number }>;

export type SendMessage = Omit<
  Message,
  'id' | 'sessionId' | 'audioKey' | 'audioState'
>;

export type MessageList = Message[];

export type Session = {
  name: string;
  id: string;
  assistantId: string;
};
export type SessionInfo = Omit<Session, 'assistant'> &
  Record<'assistant', Assistant>;

export type SessionList = Session[];

export type ChatLogsStorageType = {
  [key: string]: MessageList;
};

export type Model =
  | 'gpt-3.5-turbo'
  | 'gpt-4-vision-preview'
  | 'gpt-4-1106-preview';
export type Assistant = {
  id: string;
  name: string;
  description?: string;
  prompt: string;
  temperature?: number;
  max_log: number;
  max_tokens: number;
  model: Model;
};

export type AssistantList = Assistant[];

export type EditAssistant = Omit<Assistant, 'id'> &
  Partial<Pick<Assistant, 'id'>>;
