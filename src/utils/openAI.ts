import OpenAI from 'openai';
import { API_KEY } from './constant';
import events from '@/utils/event';

let client = new OpenAI({
  apiKey: localStorage[API_KEY] || '',
  dangerouslyAllowBrowser: true,
});

events.on('ApiKeyChange', () => {
  client = new OpenAI({
    apiKey: localStorage[API_KEY],
    dangerouslyAllowBrowser: true,
  });
});
// eslint-disable-next-line import/no-anonymous-default-export
export default () => client;
