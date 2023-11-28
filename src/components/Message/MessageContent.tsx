import { Message } from '@/types';
import { USERMAP } from '@/utils/constant';
import { Markdown } from '@/components/Markdown';
import { IconSpeakerphone } from '@tabler/icons-react';
import { ActionIcon } from '@mantine/core';
import clsx from 'clsx';
const Colors = {
  loading: '#aaa',
  playing: 'red',
  done: 'green',
};
interface Props {
  message: Message;
  showWriting: boolean;
  index: number;
  toSpeak: (message: Message, i: number) => void;
}
export default function MessageContent({
  message: item,
  showWriting,
  index,
  toSpeak,
}: Props) {
  const isUser = item.role === 'user';
  return (
    <div className='flex flex-col'>
      <div className='text-lg font-medium flex flex-row items-center'>
        {USERMAP[item.role] /*  + ' ' + item.audioKey */}
        {item.audioKey ? (
          <ActionIcon onClick={() => toSpeak(item, index)}>
            <IconSpeakerphone
              color={Colors[item.audioState || 'done']}
            />
          </ActionIcon>
        ) : (
          ''
        )}
      </div>
      <div
        className={clsx(
          {
            'whitespace-break-spaces': isUser,
          },
          'w-full',
          'max-w-4xl',
          'min-h-[1rem]'
        )}>
        {isUser ? (
          <div>{item.content}</div>
        ) : (
          <Markdown
            markdownText={
              item.content +
              (showWriting
                ? `<span style='display: inline-block;width:0.8rem;height:0.8rem;border-radius:50%;background-color:#333;margin-left:0.1rem'><span>`
                : '')
            }></Markdown>
        )}
      </div>
    </div>
  );
}
