import { IconDeviceFloppy, IconSettings } from '@tabler/icons-react';
import { ActionIcon, Modal, Input, Button } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useState, ChangeEvent, useEffect } from 'react';
import { API_KEY } from '@/utils/constant';
import events from '@/utils/event';
const Wrapper = Input.Wrapper;

export default function Setting() {
  const [opened, drawerHandler] = useDisclosure(false);
  const [apiKey, setApiKey] = useState('');
  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    setApiKey(event.target.value); // API_KEY;
  };
  const onSave = () => {
    setApiKey(apiKey); // API_KEY;
    localStorage[API_KEY] = apiKey;
    drawerHandler.close();
    const cb = (window as any).needTokenFn;
    if (cb instanceof Function) {
      cb();
      delete (window as any).needTokenFn;
    }
  };
  useEffect(() => {
    events.on('needToken', (cb: Function) => {
      (window as any).needTokenFn = cb;
      drawerHandler.open();
    });
    setApiKey(localStorage[API_KEY] || '');
    return () => {
      events.off('needToken');
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
          <Input
            type='text'
            variant='filled'
            value={apiKey}
            onChange={onChange}></Input>
        </Wrapper>
        <div className='flex justify-around mt-4'>
          <Button
            type='submit'
            leftIcon={<IconDeviceFloppy size='1.2rem' />}
            onClick={onSave}>
            保存
          </Button>
        </div>
      </Modal>
    </div>
  );
}
