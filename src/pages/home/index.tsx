import React, { useEffect, useState } from 'react';
import Message from '@/components/Message';
import SessionComp from '@/components/Session';
import NavHeader from '@/components/NavHeader';
import * as sessionStore from '@/dbs/sessionStore';
import * as assistantStore from '@/dbs/assistantStore';
import { Assistant, Session, SessionList } from '@/types';
import { MediaQuery } from '@mantine/core';
import { audioInst } from '@/utils/utils';
// import { useGetState } from '@/utils/hooks';
import { useMantineColorScheme, ActionIcon } from '@mantine/core';
import clsx from 'clsx';
import { IconMessagePlus } from '@tabler/icons-react';

export default function Home() {
  const { colorScheme } = useMantineColorScheme();
  const [session, setSession] = useState<Session>({} as Session);
  const [sessionList, setSessionList] = useState<SessionList>([]);
  const [assistant, setAssistant] = useState<Assistant>(
    {} as Assistant
  );

  const onAssistantChange = async (_assistant: Assistant) => {
    console.log('onAssistantChange', _assistant);
    if (_assistant.id === assistant.id) return;
    // 只能有一个会话话， 切换到空会话中
    if (localStorage.emptySessionId) {
      const sessionList = await sessionStore.getSessions();
      sessionList[0].assistantId = localStorage.assistantId;
      toSetSession(sessionList[0]);
      return;
    }
    createSession();
  };

  useEffect(() => {
    (async () => {
      const sessions = await sessionStore.getSessions();
      setSessionList(sessions);
      setSession(sessions[0]);
      let assistantId = sessions[0].assistantId;
      const assistants = await assistantStore.getList();
      let _assistant = assistants.find(
        (it) => it.id === assistantId
      )!;
      setAssistant(_assistant);
      localStorage.assistantId = assistantId;
    })();
  }, []);

  const createSession = async () => {
    if (localStorage.emptySessionId) return;
    const sessionId = Date.now().toString();
    localStorage.emptySessionId = sessionId;
    const newSession: Session = {
      name: `session=${sessionList.length + 1}`,
      id: sessionId,
      assistantId: localStorage.assistantId,
    };
    const list = await sessionStore.addSession(newSession);
    setSessionList(list);
    toSetSession(newSession);
  };
  const removeSession = async (id: string) => {
    if (localStorage.emptySessionId === id) {
      localStorage.emptySessionId = '';
    }
    await sessionStore.removeSession(id);
    console.log(
      'removeSession',
      // getSessionList().length
      sessionList.length
    );
    const list = sessionList.filter((session) => session.id !== id);
    toSetSession(list[0]);
    setSessionList(list);
  };
  const updateSession = async (_session: Session, name: string) => {
    const newSessionList = await sessionStore.updateSession({
      ..._session,
      name,
    });
    setSessionList(newSessionList);
  };
  const toSetSession = async (_session: Session) => {
    await audioInst.stop();
    localStorage.assistantId = _session.assistantId;
    setSession(_session);
    await sessionStore.updateSession(_session);
    const assistant = await assistantStore.getAssistant(
      _session.assistantId
    );
    setAssistant(assistant!);
  };
  if (!session.id) return <div>loading</div>;
  return (
    <div className='h-screen w-screen flex'>
      <MediaQuery
        smallerThan='md'
        styles={{
          width: '0 !important',
          padding: '0 !important',
          overflow: 'hidden',
        }}>
        <div
          className={clsx(
            {
              'bg-black/10': colorScheme === 'dark',
              'bg-gray-1s00': colorScheme === 'light',
            },
            'shadow',
            'h-screen',
            'w-64',
            'flex',
            'flex-col',
            'px-2'
          )}>
          <div className='flex justify-between py-2 w-full'>
            <ActionIcon
              onClick={() => createSession()}
              color='green'
              size='sm'>
              <IconMessagePlus size='1rem'></IconMessagePlus>
            </ActionIcon>
          </div>
          <div
            className={clsx([
              'pd-4',
              'overflow-y-auto',
              'scrollbar-none',
              'flex',
              'flex-col',
              'gap-y-2',
            ])}>
            {sessionList.map((_session) => (
              <SessionComp
                key={_session.id}
                session={_session}
                selectSessionId={session.id}
                showTrash={sessionList.length > 1}
                onChange={toSetSession}
                updateSession={updateSession}
                removeSession={removeSession}
              />
            ))}
          </div>
        </div>
      </MediaQuery>

      <div className='h-screen w-full flex flex-col items-center'>
        <NavHeader
          assistantId={assistant?.id || ''}
          onAssistantChange={onAssistantChange}
        />
        <Message session={session} assistant={assistant!}></Message>
      </div>
    </div>
  );
}
