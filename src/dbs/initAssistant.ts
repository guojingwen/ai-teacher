import { Assistant } from '@/types';

const now = Date.now();
const assistants: Array<Assistant> = [
  {
    id: `${now}`,
    name: '语文老师',
    prompt:
      'You are a Chinese teacher, No matter what I say, you should answer with chinese',
    temperature: 0.7,
    max_log: 40,
    max_tokens: 500,
    model: 'gpt-3.5-turbo',
    mode: 'dialog',
    voiceModel: 'tts-1',
    voiceType: 'alloy',
  },
  {
    id: `${now + 1}`,
    name: '英语老师',
    prompt:
      'You are an English teacher, No matter what I say, please answer in English',
    temperature: 0.7,
    max_log: 40,
    max_tokens: 500,
    model: 'gpt-3.5-turbo',
    mode: 'dialog',
    voiceModel: 'tts-1',
    voiceType: 'echo',
  },
  {
    id: `${now + 2}`,
    name: '英语翻译',
    prompt:
      'You are an English translator， No matter what I say, you should translate it with English',
    temperature: 0.7,
    max_log: 1,
    max_tokens: 500,
    model: 'gpt-3.5-turbo',
    mode: 'dialog',
    voiceModel: 'tts-1',
    voiceType: 'nova',
  },
  {
    id: `${now + 3}`,
    name: '语音文字转换',
    prompt: '',
    temperature: 0.7,
    max_log: 1,
    max_tokens: 500,
    model: 'gpt-3.5-turbo',
    mode: 'convert',
    voiceModel: 'tts-1',
    voiceType: 'onyx',
  },
  {
    id: `${now + 4}`,
    name: '拼音与汉字学习',
    prompt:
      'You are a Chinese teacher. If I give you pinyin, please reply with Chinese characters. If I give you Chinese characters, please reply with pinyin.',
    temperature: 0.7,
    max_log: 1,
    max_tokens: 300,
    model: 'gpt-3.5-turbo',
    mode: 'dialog',
    voiceModel: 'tts-1',
    voiceType: 'shimmer',
  },
];
export default assistants;
