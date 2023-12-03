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
import { API_KEY, EMPTY_SESSION_ID } from '@/utils/constant';
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
import Voice from '../Voice';
import {
  Mp3Recorder,
  arrayBufferToBase64,
  audioInst,
  blobToBase64,
} from '@/utils/utils';
import { useGetState } from '@/utils/hooks';
import MessageContent from './MessageContent';
import device from '@/utils/device';
import getClient from '@/utils/openAI';

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
      messageStore.addMessage(newMsg);
      newList = [...messages, newMsg];
    }
    scrollRef.current!.scrollTop += 200;
    setMessageList(newList);
  };

  const onSubmit = async (_prompt?: string, audioKey?: number) => {
    const newPrompt = prompt.trim() || _prompt;
    if (!newPrompt) return;
    if (!localStorage[API_KEY]) {
      await new Promise((resolve) => {
        events.emit('needToken', resolve);
      });
    }
    if (assistant.mode === 'convert') {
      // 语音转文字
      const lastMsg: Message = {
        id: `${Date.now()}`,
        role: 'user',
        content: newPrompt,
        sessionId: session.id,
        audioKey: -1,
        audioState: 'loading',
      };
      messageStore.addMessage(lastMsg);
      const mgs = getMessageList().slice();
      if (!mgs.length) {
        // 最多只能有一个空会话
        localStorage[EMPTY_SESSION_ID] = '';
      }
      setMessageList([...mgs, lastMsg]);
      setPrompt('');
      setTimeout(() => {
        scrollRef.current!.scrollTop += 200;
      }, 100);

      const audio = await getClient().audio.speech.create({
        model: assistant.voiceModel,
        voice: assistant.voiceType,
        input: newPrompt,
      });
      const arrayBuffer = await audio.arrayBuffer();
      const audioBase64 = await arrayBufferToBase64(arrayBuffer);
      // 存储
      const audioKey = await audioStore.addAudio(audioBase64);
      lastMsg.audioKey = audioKey;
      lastMsg.audioState = 'playing';
      messageStore.updateMessage(lastMsg);
      const newList = [...mgs, lastMsg];
      playVoice(newList, audioBase64, newList.length - 1);
      return;
    }
    if (loading) {
      chatService.cancel();
      return;
    }
    const _msgs = getMessageList();
    if (!_msgs.length) {
      // 最多只能有一个空会话
      localStorage[EMPTY_SESSION_ID] = '';
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
    const file = new File([blob], 'prompt.mp3');
    const transcription =
      await getClient().audio.transcriptions.create({
        file,
        model: 'whisper-1',
      });
    if (assistant.mode === 'convert') {
      // 语音转文字
      __resolve();
      const lastMsg: Message = {
        id: `${Date.now()}`,
        role: 'user',
        content: transcription.text,
        sessionId: session.id,
        audioKey: await audioKeyPromise,
        audioState: 'done',
      };
      messageStore.addMessage(lastMsg);
      const newList = [...getMessageList(), lastMsg];
      setMessageList(newList);
      // const audioBase64 = await blobToBase64(blob);
      // playVoice(newList, audioBase64, newList.length - 1);
      return;
    }
    onSubmit(transcription.text, await audioKeyPromise); // 请求

    // 3 text completion
    const respText = await new Promise((resolve) => {
      _resolve = resolve;
    });
    __resolve(); // 更新 <NewVoice/> 状态

    //  4. text to speech
    const audio = await getClient().audio.speech.create({
      model: assistant.voiceModel,
      voice: assistant.voiceType,
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
  const playVoice = async (
    msgs: MessageList,
    audioBase64: string,
    index: number
  ) => {
    if ((device.isSafari || device.isIos) && !window._voiceOpened) {
      await new Promise((resolve) => {
        events.emit('toOpenVoice', resolve);
      });
    }
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
    const newList = getMessageList().slice();
    let audioState = item.audioState;
    if (audioState === 'loading' && item.audioKey) return;
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
      if ((device.isSafari || device.isIos) && !window._voiceOpened) {
        await new Promise((resolve) => {
          events.emit('toOpenVoice', resolve);
        });
      }
      audioState = 'playing';
      if (item.audioKey) {
        const audioBase64 = await audioStore.getAudio(item.audioKey!);
        playVoice(newList, audioBase64, i);
        return;
      }
      const [audioKey, audioBase64] = await addAudioResource(item);
      const newItem: Message = {
        ...item,
        audioKey,
        audioState,
      };
      await messageStore.updateMessage(newItem);
      newList.splice(i, 1, newItem);
      playVoice(newList, audioBase64, i);
      return;
    }
  };
  async function addAudioResource(
    item: Message
  ): Promise<[number, string]> {
    const audio = await getClient().audio.speech.create({
      model: assistant.voiceModel,
      voice: assistant.voiceType,
      input: item.content,
    });
    const arrayBuffer = await audio.arrayBuffer();
    const audioBase64 = await arrayBufferToBase64(arrayBuffer);

    // 存储
    const audioKey = await audioStore.addAudio(audioBase64);
    return [audioKey, audioBase64];
  }
  const setModeWrap = (mode: string) => {
    if (mode === 'text') {
      Mp3Recorder.stop(); // 容错
    }
    setMode(mode);
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
          'px-4',
          'item-start',
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
          'w-full',
          'max-w-2xl',
          'px-4',
          'h-[4rem]'
        )}>
        <ActionIcon
          disabled={loading}
          onClick={() =>
            setModeWrap(mode === 'text' ? 'audio' : 'text')
          }>
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
