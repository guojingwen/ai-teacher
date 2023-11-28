import { Model } from '@/types';

export const MESSAGE_STORE = 'ai_assistant_message';
export const SESSION_STORE = 'ai_assistant_session';
export const ASSISTANT_STORE = 'ai_assistant';
export const AUDIO_STORE = 'ai_assistant_audio';
export const API_KEY = 'ai_api_key';

export const MAX_TOKEN = 1000;
export const TEMPERATURE = 0.7;
export const USERMAP = {
  user: '用户',
  assistant: '助手',
  system: '系统',
};
export const ASSISTANT_INIT = [
  {
    name: 'AI助手',
    prompt: '你是一个智慧的AI助手，任务是详细地回答用户的每一个问题',
    temperature: 0.7,
    max_log: 20,
    max_tokens: 800,
    model: 'gpt-3.5-turbo' as Model,
  },
];
