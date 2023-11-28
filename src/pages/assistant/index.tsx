import { AssistantList, EditAssistant } from '@/types';
import * as assistionStore from '@/dbs/assistantStore';
import { ASSISTANT_INIT } from '@/utils/constant';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ActionIcon,
  Card,
  Text,
  Group,
  Drawer,
  Badge,
} from '@mantine/core';
import {
  IconChevronLeft,
  IconUserPlus,
  IconPencil,
} from '@tabler/icons-react';
import AssistionConfig from '@/components/AssistantConfig';

const showNotification = (message: string) => {
  notifications.show({
    id: 'Success',
    title: 'Success',
    message,
    color: 'green',
    autoClose: 2000,
  });
};

const Assistant = () => {
  const [assistantList, setAssistantList] = useState<AssistantList>(
    []
  );
  const [opened, drawerHandler] = useDisclosure(false);
  const [editAssistant, setEditAssistant] = useState<EditAssistant>();

  useEffect(() => {
    assistionStore.getList().then(setAssistantList);
  }, []);
  const saveAssistant = async (data: EditAssistant) => {
    if (data.id) {
      let newAssistantList = await assistionStore.updateAssistant(
        data.id,
        data
      );
      setAssistantList(newAssistantList);
    } else {
      const newAssistant = {
        ...data,
        id: Date.now().toString(),
      };
      const newAssistantList =
        await assistionStore.addAssistant(newAssistant);
      setAssistantList(newAssistantList);
    }
    showNotification('保存成功');
    drawerHandler.close();
  };

  const removeAssistant = async (id: string) => {
    let newAssistantList = await assistionStore.removeAssistant(id);
    setAssistantList(newAssistantList);
    showNotification('移除成功');
    drawerHandler.close();
  };
  const onEditAssistant = (data: EditAssistant) => {
    setEditAssistant(data);
    drawerHandler.open();
  };
  const onAddAssistant = () => {
    const newAssistant = {
      ...ASSISTANT_INIT[0],
      name: `助理_${assistantList.length + 1} 号`,
    };
    setEditAssistant(newAssistant);
    drawerHandler.open();
  };
  return (
    <div className='h-screen flex flex-col'>
      <div className='flex p-4 shadow-sm justify-between'>
        <Link to='/'>
          <ActionIcon>
            <IconChevronLeft></IconChevronLeft>
          </ActionIcon>
        </Link>
        <Text size='lg'>助理</Text>
        <ActionIcon onClick={() => onAddAssistant()}>
          <IconUserPlus></IconUserPlus>
        </ActionIcon>
      </div>
      <div className='flex gap-8 flex-wrap p-4 overflow-y-auto'>
        {assistantList.map((item) => (
          <Card
            key={item.id}
            shadow='sm'
            padding='lg'
            radius='md'
            className='w-full max-w-sm group translate-all duration-300'>
            <Text weight={500} className='line-clamp-1'>
              {item.name}
            </Text>
            <Text
              size='sm'
              color='dimmed'
              className='line-clamp-3 mt-2'>
              {item.prompt}
            </Text>
            <Group className='mt-4 flex items-center'>
              <Group>
                <Badge size='md' color='green' radius='sm'>
                  TOKEN: {item.max_tokens}
                </Badge>
                <Badge size='md' color='blue' radius='sm'>
                  TEMP: {item.temperature}
                </Badge>
                <Badge size='md' color='cyan' radius='sm'>
                  LOGS: {item.max_log}
                </Badge>
              </Group>
              <Group>
                <ActionIcon
                  size='sm'
                  onClick={() => onEditAssistant(item)}>
                  <IconPencil></IconPencil>
                </ActionIcon>
              </Group>
            </Group>
          </Card>
        ))}
      </div>
      <Drawer
        opened={opened}
        onClose={drawerHandler.close}
        size='lg'
        position='right'>
        <AssistionConfig
          assistant={editAssistant!}
          save={saveAssistant}
          remove={removeAssistant}
        />
      </Drawer>
    </div>
  );
};
export default Assistant;
