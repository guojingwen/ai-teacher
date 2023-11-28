import { Model, SendMessage } from '@/types';
import {
  ParsedEvent,
  ReconnectInterval,
  createParser,
} from 'eventsource-parser';
import { API_KEY, MAX_TOKEN, TEMPERATURE } from './constant';

interface StreamParamsOptions {
  temperature?: number;
  max_tokens?: number;
  prompt: string;
  model: Model;
}
type StreamParams = {
  prompt: string;
  history?: SendMessage[];
  options?: StreamParamsOptions;
};

type Actions = {
  onCompleting: (sug: string) => void;
  onCompleted?: (sug: string) => void;
};
class ChatService {
  private static instance: ChatService;
  public actions?: Actions;
  private constroller = new AbortController();
  public static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }
  public async getStream(params: StreamParams) {
    const { history = [], options = {} as StreamParamsOptions } =
      params;
    const { max_tokens, temperature } = options;
    let suggesting = '';
    const url = 'https://api.openai.com/v1/chat/completions';
    // https://dash.cloudflare.com/
    // const url =
    // ('https://worker-aged-pond-c762.jackqiao2908.workers.dev/v1/chat/completions');
    try {
      const resp = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage[API_KEY]}`,
        },
        method: 'POST',
        body: JSON.stringify({
          model: options.model,
          messages: [
            {
              role: 'system',
              content: options.prompt,
            },
            ...history!,
          ],
          stream: true,
          // ...options,
          temperature: +(temperature || TEMPERATURE),
          max_tokens: +(max_tokens || MAX_TOKEN),
        }),
        signal: this.constroller.signal,
      });
      if (resp.status !== 200) {
        return resp.body;
      }
      const data = resp.body;
      if (!data) {
        return;
      }
      const decoder = new TextDecoder('utf-8');
      const reader = data.getReader();
      let done = false;
      let counter = 0;
      const onParse = (event: ParsedEvent | ReconnectInterval) => {
        if (event.type === 'event') {
          const data = event.data;
          if (data === '[DONE]') {
            return;
          }
          try {
            const json = JSON.parse(data);
            const text = json.choices[0]?.delta?.content || '';
            if (counter < 2 && (text.match(/\n/) || []).length) {
              return;
            }
            suggesting += text;
            counter++;
          } catch (error) {
            console.error(11, error);
          }
        }
      };
      const parser = createParser(onParse);
      while (!done) {
        const { value, done: doneReadingStream } =
          await reader.read();
        done = doneReadingStream;
        parser.feed(decoder.decode(value));
        this.actions?.onCompleting(suggesting);
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    } catch (error) {
      console.log('abort', error);
    } finally {
      this.actions?.onCompleted?.(suggesting);
      this.constroller = new AbortController();
    }
  }
  public cancel() {
    try {
      this.constroller?.abort();
      this.constroller = new AbortController();
    } catch (error) {
      console.error('abort', error);
    }
  }
}

const chatService = ChatService.getInstance();

export default chatService;
