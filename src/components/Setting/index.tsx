import { IconDeviceFloppy, IconSettings } from '@tabler/icons-react';
import { ActionIcon, Modal, Input, Button } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useState, ChangeEvent, useEffect } from 'react';
import { API_KEY } from '@/utils/constant';
import events from '@/utils/event';
import { notifications } from '@mantine/notifications';
const Wrapper = Input.Wrapper;

export default function Setting() {
  const [opened, drawerHandler] = useDisclosure(false);
  const [opened2, drawerHandler2] = useDisclosure(false);
  const [apiKey, setApiKey] = useState('');
  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    setApiKey(event.target.value); // API_KEY;
  };
  const [, setVoiceOpened] = useState<boolean>(
    window._voiceOpened || false
  );
  const toSetVoiceOpened = () => {
    window._voiceOpened = true;
    setTimeout(() => {
      setVoiceOpened(true);
      notifications.show({
        id: 'Success',
        // title: '音频播放已打开',
        message: '音频播放已打开',
        color: 'green',
        autoClose: 2000,
      });
      if (window.needOpenVoice) {
        drawerHandler2.close();
        window.needOpenVoice();
      }
    }, 1000);
  };

  const onSave = () => {
    setApiKey(apiKey); // API_KEY;
    localStorage[API_KEY] = apiKey;
    events.emit('ApiKeyChange');
    drawerHandler.close();
    const cb = window.needTokenFn;
    if (cb instanceof Function) {
      cb();
      window.needTokenFn = null;
    }
  };
  useEffect(() => {
    events.on('needToken', (cb: Function) => {
      window.needTokenFn = cb;
      drawerHandler.open();
    });
    setApiKey(localStorage[API_KEY] || '');
    return () => {
      events.off('needToken');
    };
  }, []);
  useEffect(() => {
    events.on('toOpenVoice', (cb: Function) => {
      window.needOpenVoice = cb;
      drawerHandler2.open();
    });
    return () => {
      events.off('toOpenVoice');
    };
  }, []);
  return (
    <div>
      <ActionIcon
        variant='subtle'
        size='xs'
        onClick={() => {
          drawerHandler.open();
        }}>
        <IconSettings></IconSettings>
      </ActionIcon>
      <Modal opened={opened} onClose={drawerHandler.close} size='sm'>
        <Wrapper
          label='OPENAI_API_KEY'
          description='来自platform.openai.com后台设置'>
          <div className='flex flex-row flex-1 justify-between items-center full-width mb-6'>
            <Input
              className='flex-1'
              type='text'
              variant='filled'
              value={apiKey}
              onChange={onChange}></Input>
            <Button
              className='ml-2'
              type='submit'
              leftIcon={<IconDeviceFloppy size='1.2rem' />}
              onClick={onSave}>
              保存
            </Button>
          </div>
        </Wrapper>
      </Modal>
      <Modal
        opened={opened2}
        onClose={drawerHandler2.close}
        size='sm'>
        <Wrapper
          label='开启音频'
          description='由于苹果系统限制，必须先打开音频，才支持自动朗读'>
          <audio
            controls
            className='w-4 mt-2'
            onPlay={toSetVoiceOpened}>
            <source src='https://static.warmplace.cn/ai-teacher.mp3' />
          </audio>
        </Wrapper>
      </Modal>
    </div>
  );
}
