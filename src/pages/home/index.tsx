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
import device from '@/utils/device';
import { ASSISTANT_ID, EMPTY_SESSION_ID } from '@/utils/constant';

export default function Home() {
  const { colorScheme } = useMantineColorScheme();
  const [session, setSession] = useState<Session>({} as Session);
  const [sessionList, setSessionList] = useState<SessionList>([]);
  const [assistant, setAssistant] = useState<Assistant>(
    {} as Assistant
  );

  const onAssistantChange = async (_assistant: Assistant) => {
    console.log(
      'onAssistantChange',
      _assistant,
      localStorage[ASSISTANT_ID]
    );
    if (_assistant.id === assistant.id) {
      console.log('更新_assistant name');
      return;
    }

    // 只能有一个会话， 切换到空会话中
    if (localStorage[EMPTY_SESSION_ID]) {
      const sessionList = await sessionStore.getSessions();
      const firstSession = {
        ...sessionList[0],
      };
      firstSession.assistantId = localStorage[ASSISTANT_ID];
      const assistant = (await assistantStore.getAssistant(
        localStorage[ASSISTANT_ID]
      ))!;
      setAssistant(assistant);
      firstSession.name = getNewSessionName(assistant); // 更新会话的名称
      setSession(firstSession);
      await sessionStore.updateSession(firstSession);
      const newSessionList = [firstSession, ...sessionList.slice(1)];
      setSessionList(newSessionList);
      return;
    }
    createSession();
  };
  const getNewSessionName = (assistant: Assistant): string => {
    const suffix = sessionList.reduce((sum, it) => {
      if (it.assistantId === assistant.id) {
        sum += 1;
      }
      return sum;
    }, 0);
    return `${assistant.name}-会话${suffix ? `${suffix + 1}` : ''}`;
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
      localStorage[ASSISTANT_ID] = assistantId;
    })();
  }, []);

  const createSession = async () => {
    if (localStorage[EMPTY_SESSION_ID]) return;
    const sessionId = Date.now().toString();
    localStorage[EMPTY_SESSION_ID] = sessionId;
    let newAssistant = assistant;
    if (assistant.id !== localStorage[ASSISTANT_ID]) {
      newAssistant = (await assistantStore.getAssistant(
        localStorage[ASSISTANT_ID]
      ))!;
      setAssistant(newAssistant);
    }
    const newSession: Session = {
      name: getNewSessionName(newAssistant),
      id: sessionId,
      assistantId: localStorage[ASSISTANT_ID],
    };
    setSession(newSession);
    const list = await sessionStore.addSession(newSession);
    setSessionList(list);
  };
  const removeSession = async (id: string) => {
    if (localStorage[EMPTY_SESSION_ID] === id) {
      localStorage[EMPTY_SESSION_ID] = '';
    }
    await sessionStore.removeSession(id);
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
    localStorage[ASSISTANT_ID] = _session.assistantId;
    setSession(_session);
    await sessionStore.updateSession(_session);
    const assistant = await assistantStore.getAssistant(
      _session.assistantId
    );
    setAssistant(assistant!);
  };
  if (!session.id) return <div></div>;
  return (
    <div
      className={clsx(['h-full', 'w-screen', 'flex'])}
      style={{
        height: device.isIos ? `${window.innerHeight}px` : '100vh',
      }}>
      <MediaQuery
        smallerThan='sm'
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
            'h-full',
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

      <div className='h-full w-full flex flex-col items-center'>
        <NavHeader
          assistantId={assistant?.id || ''}
          onAssistantChange={onAssistantChange}
          selectSessionProps={{
            sessionList,
            createSession,
            toSetSession,
            updateSession,
            removeSession,
            sessionId: session.id,
          }}
        />
        <Message session={session} assistant={assistant!}></Message>
      </div>
    </div>
  );
}
