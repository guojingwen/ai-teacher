import chatService from '@/utils/chatService';
import { useEffect, useState, KeyboardEvent, useRef } from 'react';
import {
  ActionIcon,
  Input,
  useMantineColorScheme,
} from '@mantine/core';
import * as messageStore from '@/dbs/messageStore';
import * as audioStore from '@/dbs/audioStore';
import {
  IconSend,
  IconSendOff,
  IconRobot,
  IconUser,
} from '@tabler/icons-react';
import { API_KEY } from '@/utils/constant';
import events from '@/utils/event';
import './message.css';
import { IconKeyboard, IconMicrophone } from '@tabler/icons-react';
import {
  Assistant,
  Message,
  MessageAndIndex,
  MessageList,
  SendMessage,
  Session,
} from '@/types';
import clsx from 'clsx';
import { Voice } from '../Voice';
import React from 'react';
import OpenAI from 'openai';
import {
  arrayBufferToBase64,
  audioInst,
  blobToBase64,
} from '@/utils/utils';
import { useGetState } from '@/utils/hooks';
import MessageContent from './MessageContent';

type Props = {
  session: Session;
  assistant: Assistant;
};

let _resolve: any;
const MessageComp = ({ session, assistant }: Props) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessageList, getMessageList] =
    useGetState<MessageList>([]);
  const scrollRef = useRef<HTMLDivElement>();
  const [mode, setMode, getMode] = useGetState('text');
  const { colorScheme } = useMantineColorScheme();

  chatService.actions = {
    onCompleting: (sug) => setSuggestion(sug),
    onCompleted: (sug: string) => {
      if (getMode() === 'text') {
        setLoading(false);
      } else {
        _resolve?.(sug);
        setLoading(false);
      }
    },
  };

  useEffect(() => {
    (async () => {
      const msgs = await messageStore.getMessages(session.id);
      setMessageList(msgs);
      if (loading) {
        chatService.cancel();
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.id]);

  const onKeyDown = (evt: KeyboardEvent<HTMLInputElement>) => {
    if (evt.keyCode === 13 && !evt.shiftKey) {
      evt.preventDefault();
      onSubmit();
    }
  };

  const setSuggestion = (suggestion: string) => {
    if (suggestion === '') return;
    const len = messages.length;
    const lastMsg = messages[len - 1];
    let newList: MessageList = [];
    if (lastMsg?.role === 'assistant') {
      lastMsg.content = suggestion;
      newList = [...messages.slice(0, len - 1), lastMsg];
      messageStore.updateMessage({
        ...lastMsg,
        audioState: undefined,
      });
    } else {
      const newMsg: Message = {
        id: `${Date.now()}`,
        sessionId: session.id,
        role: 'assistant',
        // -1 先标识为语音
        audioKey: getMode() === 'audio' ? -1 : undefined,
        audioState: 'loading',
        content: suggestion,
      };
      console.log('新增消息', getMode(), suggestion, newMsg);
      messageStore.addMessage(newMsg);
      newList = [...messages, newMsg];
    }
    scrollRef.current!.scrollTop += 200;
    setMessageList(newList);
  };

  const onSubmit = async (_prompt?: string, audioKey?: number) => {
    if (!localStorage[API_KEY]) {
      await new Promise((resolve) => {
        events.emit('needToken', resolve);
      });
    }
    if (loading) {
      chatService.cancel();
      return;
    }
    const newPrompt = prompt.trim() || _prompt;
    if (!newPrompt) return;
    const _msgs = getMessageList();
    if (!_msgs.length) {
      // 最多只能有一个空会话
      localStorage.emptySessionId = '';
    }
    const lastMsg: Message = {
      id: `${Date.now()}`,
      role: 'user',
      content: newPrompt,
      sessionId: session.id,
      audioKey,
    };
    messageStore.addMessage(lastMsg);
    let list: MessageList = [..._msgs, lastMsg];
    setLoading(true);
    setMessageList(list);
    // requestIdleCallback safari不兼容
    setTimeout(() => {
      scrollRef.current!.scrollTop += 200;
    }, 100);
    chatService.getStream({
      prompt,
      history: list.slice(-assistant!.max_log).map((it) => {
        const newIt: any = {
          role: it.role,
          content: it.content,
        };
        return newIt as SendMessage;
      }),
      options: assistant,
    });
    setPrompt('');
  };
  const isLight = colorScheme === 'light';

  useEffect(() => {
    events.on('audioData', answer);
    return () => {
      events.off('audioData');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.id, assistant.id]);
  const answer = async ([blob, __resolve]: [Blob, any]) => {
    // 1 存储音频
    const sendAudio = await blobToBase64(blob);
    const audioKeyPromise = audioStore.addAudio(sendAudio);

    // 2 speech to text
    const client = new OpenAI({
      apiKey: localStorage[API_KEY],
      dangerouslyAllowBrowser: true,
    });
    const file = new File([blob], 'prompt.mp3');
    const transcription = await client.audio.transcriptions.create({
      file,
      model: 'whisper-1',
    });
    onSubmit(transcription.text, await audioKeyPromise); // 请求

    // 3 text completion
    const respText = await new Promise((resolve) => {
      _resolve = resolve;
    });
    __resolve(); // 更新 <NewVoice/> 状态

    //  4. text to speech
    const audio = await client.audio.speech.create({
      model: 'tts-1',
      voice: 'nova',
      input: respText as string,
    });
    const arrayBuffer = await audio.arrayBuffer();
    const audioBase64 = await arrayBufferToBase64(arrayBuffer);
    // 存储
    const audioKey = await audioStore.addAudio(audioBase64);
    const msgs = getMessageList();
    const lastMsg = msgs.at(-1)!;
    lastMsg.audioKey = audioKey;
    const len = msgs.length;
    const newList = [...msgs.slice(0, len - 1), lastMsg];
    messageStore.updateMessage(lastMsg);
    playVoice(newList, audioBase64, len - 1);
  };
  const playVoice = (
    msgs: MessageList,
    audioBase64: string,
    index: number
  ) => {
    const old = audioInst.getAddi();
    const newList = msgs.slice();
    if (old) {
      newList.splice(old.index, 1, {
        ...old,
        audioState: 'done',
      });
      delete (newList[old.index] as MessageAndIndex).index;
      audioInst.stop();
    }
    newList[index].audioState = 'playing';

    setMessageList(newList);
    audioInst.play(
      audioBase64,
      {
        ...newList[index],
        index: index,
      },
      (msg: MessageAndIndex) => {
        const list = getMessageList().slice();
        list.splice(msg.index!, 1, {
          ...msg,
          audioState: 'done',
        });
        delete (list[msg.index!] as MessageAndIndex).index;
        setMessageList(list);
      }
    );
  };
  const toSpeak = async (item: Message, i: number) => {
    console.log('toSpeak', item, i);
    const newList = getMessageList().slice();
    let audioState = item.audioState;
    if (audioState === 'loading') return;
    if (audioState === 'playing') {
      audioInst.stop();
      audioState = 'done';
      const newItem: Message = {
        ...item,
        audioState,
      };
      newList.splice(i, 1, newItem);
      setMessageList(newList);
    } else {
      audioState = 'playing';
      const audioBase64 = await audioStore.getAudio(item.audioKey!);
      playVoice(newList, audioBase64, i);
    }
  };
  return (
    <>
      <div
        className={clsx([
          'flex-col',
          'h-[calc(100vh-10rem)]',
          'w-full',
          'max-w-2xl',
          'overflow-y-auto',
          'rounded-sm',
          'px-8',
        ])}
        ref={(_ref) => (scrollRef.current = _ref!)}>
        {messages.map((item, idx) => {
          const isUser = item.role === 'user';
          return (
            <div key={`${item.role}-${idx}`} className={clsx('mt-4')}>
              <div className={clsx('flex', 'flex-row', 'mb-10')}>
                <div
                  className={clsx(
                    {
                      'bg-violet-600': !isUser,
                      'bg-sky-500': isUser,
                    },
                    'flex-none',
                    'mr-4',
                    'rounded-full',
                    'h-8',
                    'w-8',
                    'flex',
                    'justify-center',
                    'items-center'
                  )}>
                  {isUser ? (
                    <IconUser color='white' size={24} />
                  ) : (
                    <IconRobot color='white' size={24} />
                  )}
                </div>
                <MessageContent
                  index={idx}
                  message={item}
                  toSpeak={toSpeak}
                  showWriting={idx === messages.length - 1 && loading}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div
        className={clsx(
          'flex',
          'items-center',
          'my-4',
          'w-full',
          'max-w-xl'
        )}>
        <ActionIcon
          disabled={loading}
          onClick={() => setMode(mode === 'text' ? 'audio' : 'text')}>
          {mode !== 'text' ? (
            <IconKeyboard
              size={30}
              color={isLight ? '#333' : '#ccc'}
            />
          ) : (
            <IconMicrophone
              size={30}
              color={isLight ? '#333' : '#ccc'}
            />
          )}
        </ActionIcon>
        <div className='ml-2 w-full flex items-center rounded-2xl border-solid border border-slate-300 overflow-hidden'>
          {mode === 'text' ? (
            <>
              <Input
                placeholder='Enter 发送消息；Shift + Enter 换行；'
                className={clsx([
                  {
                    'placeholder:text-slate-200': !isLight,
                    'bg-black/10': !isLight,
                  },
                  'w-full',
                  'border-0',
                  'ml-3',
                  'h-12',
                ])}
                value={prompt}
                onKeyDown={(evt) => onKeyDown(evt)}
                onChange={(evt) =>
                  setPrompt(evt.target.value)
                }></Input>
              <ActionIcon className='mr-1' onClick={() => onSubmit()}>
                {loading ? (
                  <IconSendOff color='#333' />
                ) : (
                  <IconSend color={prompt ? '#333' : '#ccc'} />
                )}
              </ActionIcon>
            </>
          ) : (
            <Voice />
          )}
        </div>
      </div>
    </>
  );
};
export default MessageComp;
