import { SelectSessionProps, SessionList } from '@/types';
import {
  ActionIcon,
  Drawer,
  useMantineColorScheme,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconMenu2, IconMessagePlus } from '@tabler/icons-react';
import clsx from 'clsx';
import SessionComp from '../Session';
import './style.css';
// eslint-disable-next-line import/no-anonymous-default-export
export default function ({
  sessionList,
  createSession,
  toSetSession,
  updateSession,
  removeSession,
  sessionId,
}: SelectSessionProps) {
  const [opened, drawerHandler] = useDisclosure(false);
  const { colorScheme } = useMantineColorScheme();
  return (
    <>
      <ActionIcon onClick={() => drawerHandler.open()}>
        <IconMenu2 />
      </ActionIcon>
      <Drawer
        className='my-session-box'
        opened={opened}
        onClose={drawerHandler.close}
        size={300}
        position='left'>
        <div
          className={clsx(
            {
              'bg-black/10': colorScheme === 'dark',
              'bg-gray-1s00': colorScheme === 'light',
            },
            'h-full',
            'w-64',
            'flex',
            'flex-col'
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
                selectSessionId={sessionId}
                showTrash={sessionList.length > 1}
                onChange={toSetSession}
                updateSession={updateSession}
                removeSession={removeSession}
              />
            ))}
          </div>
        </div>
      </Drawer>
    </>
  );
}
