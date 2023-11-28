import React, { useState, useEffect, useMemo } from 'react';
import { ActionIcon, useMantineColorScheme } from '@mantine/core';
import {
  IconMicrophone,
  IconLoader2,
  IconPointer,
} from '@tabler/icons-react';
import MicroRecorder from 'mic-recorder-to-mp3';
import clsx from 'clsx';
import events from '@/utils/event';
import { notifications } from '@mantine/notifications';

const Mp3Recorder = new MicroRecorder({
  bitRate: 128,
});

let recordStart = Date.now();
export function Voice() {
  const [isRecording, setIsRecording] = useState(false);
  const [isGranted, setIsGranted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const isDisabled = useMemo(() => {
    return isLoading || !isGranted;
  }, [isLoading, isGranted]);
  const { colorScheme } = useMantineColorScheme();
  const isLight = colorScheme === 'light';
  // get audio granted
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ audio: true }).then(
      () => {
        setIsGranted(true);
      },
      () => {
        setIsGranted(false);
      }
    );
  });
  const start = () => {
    Mp3Recorder.start().then(() => {
      recordStart = Date.now();
      setIsRecording(true);
    });
  };
  const end = () => {
    if (Date.now() - recordStart < 1000) {
      Mp3Recorder.stop();
      notifications.show({
        id: 'warning',
        title: '',
        message: '说话时间太短！',
        autoClose: 2000,
      });
      setIsRecording(false);
      return;
    }
    Mp3Recorder.stop()
      .getMp3()
      .then(([buffer, blob]: any) => {
        setIsRecording(false);
        setIsLoading(true);
        return new Promise((resolve) => {
          events.emit('audioData', [blob, resolve]);
        });
      })
      .then(() => {
        setIsLoading(false);
      });
  };

  return (
    <ActionIcon
      className='w-full flex flex-row items-center justify-center h-12'
      disabled={isDisabled}
      onMouseDown={start}
      onMouseUp={end}>
      {isLoading ? (
        <div className='flex items-center text-slate-500'>
          <IconLoader2
            size='1rem'
            className='animate-spin mr-2'></IconLoader2>
          加载中...
        </div>
      ) : (
        <div
          className={clsx([
            {
              'text-gray-600': isLight,
            },
            'flex',
            'items-center',
          ])}>
          <IconPointer className='mr-2' size='1rem'></IconPointer>
          按住说话~
        </div>
      )}
      <IconMicrophone
        color={isRecording ? 'red' : 'green'}></IconMicrophone>
    </ActionIcon>
  );
}
