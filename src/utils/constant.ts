import {
  AssistantMode,
  Model,
  VOICETYPE,
  Voice_Model,
} from '@/types';

export const MESSAGE_STORE = 'ai_assistant_message';
export const SESSION_STORE = 'ai_assistant_session';
export const ASSISTANT_STORE = 'ai_assistant';
export const AUDIO_STORE = 'ai_assistant_audio';

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
    mode: 'dialog' as AssistantMode,
    voiceModel: 'tts-1' as Voice_Model,
    voiceType: 'alloy' as VOICETYPE,
  },
];
export const VOICE_MODEL = ['tts-1', 'tts-1-hd'];
export const VOICE_TYPES = [
  'alloy',
  'echo',
  'fable',
  'onyx',
  'nova',
  'shimmer',
];

export const ASSISTANT_MODE = [
  {
    value: 'dialog',
    label: '对话模式',
  },
  {
    value: 'convert',
    label: '语音文字转换模式',
  },
] as Array<{ value: AssistantMode; label: string }>;

// localStoarge相关常量
export const API_KEY = 'ai_api_key';
export const ASSISTANT_ID = 'assistant_id';
export const EMPTY_SESSION_ID = 'empty_session_id';
