import { Session } from '@/types';
import { useMantineColorScheme } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import clsx from 'clsx';
import { EdittableText } from '../EdittableText';

type Props = {
  session: Session;
  selectSessionId: string;
  showTrash: boolean;
  onChange: (arg: Session) => void;
  updateSession: (session: Session, name: string) => void;
  removeSession: (sessionId: string) => void;
};
const itemBaseClasses =
  'flex cursor-pointer h-[2.4rem] items-center justify-around group px-4 rounded-md';
const generateItemClasses = (
  id: string,
  sessionId: string,
  colorScheme: string
) => {
  return clsx([
    itemBaseClasses,
    colorScheme,
    {
      'hover:bg-gray-300/60': colorScheme === 'light',
      'bg-gray-200/60': id !== sessionId && colorScheme === 'light',
      'bg-gray-300': id === sessionId && colorScheme === 'light',
      'hover:bg-zinc-800/50': colorScheme === 'dark',
      'bg-zinc-800/20': id !== sessionId && colorScheme === 'dark',
      'bg-zinc-800/90': id === sessionId && colorScheme === 'dark',
    },
  ]);
};

const SessionComp = ({
  session,
  selectSessionId,
  showTrash,
  onChange,
  updateSession,
  removeSession,
}: Props) => {
  const { colorScheme } = useMantineColorScheme();

  return (
    <div
      key={session.id}
      onClick={() => {
        if (session.id !== selectSessionId) {
          onChange(session);
        }
      }}
      className={generateItemClasses(
        session.id,
        selectSessionId,
        colorScheme
      )}>
      <EdittableText
        text={session.name}
        onSave={(name) =>
          updateSession(session, name)
        }></EdittableText>
      {/* <div>{name}</div> */}
      {showTrash ? (
        <IconTrash
          size='.8rem'
          color='grey'
          onClick={(event) => {
            event.stopPropagation();
            removeSession(session.id);
          }}
          className='mx-1 invisible group-hover:visible'></IconTrash>
      ) : null}
    </div>
  );
};

export default SessionComp;
