import { EditAssistant, Model } from '@/types';
import React, { FormEvent, useState } from 'react';
import { Button, Input, Select } from '@mantine/core';
import { IconDeviceFloppy, IconTrash } from '@tabler/icons-react';

const { Wrapper } = Input;

type Props = {
  assistant: EditAssistant;
  save: (data: EditAssistant) => void;
  remove: (id: string) => void;
};
const AssistantConfig = ({ assistant, save, remove }: Props) => {
  const [data, setData] = useState<EditAssistant>(assistant);
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    save(data);
  };

  const onChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    name = 'name'
  ) => {
    setData({
      ...data,
      [name]: event.target.value,
    });
  };

  const onNumberChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    name: string
  ) => {
    const value = event.target.value;
    if (value === '') return;
    setData({
      ...data,
      [name]: value,
    });
  };
  const models = [
    'gpt-3.5-turbo',
    'gpt-4-vision-preview',
    'gpt-4-1106-preview',
  ];
  const onModelChange = (value: Model) => {
    setData({
      ...data,
      model: value,
    });
  };
  return (
    <div className='w-full flex justify-center'>
      <form
        onSubmit={onSubmit}
        className='w-full flex flex-col gap-4'>
        <Wrapper label='名称' description='助理名称'>
          <Input
            type='text'
            variant='filled'
            value={data.name}
            onChange={onChange}></Input>
        </Wrapper>
        <Wrapper label='指令' description='为角色分配的系统指令'>
          <Input
            type='textarea'
            variant='filled'
            value={data.prompt}
            name='prompt'
            onChange={(val) => onChange(val, 'prompt')}></Input>
        </Wrapper>
        <Wrapper label='model' description='选择model'>
          <Select
            size='sm'
            onChange={onModelChange}
            value={data.model}
            className='w-40 mx-2'
            data={models.map((item) => ({
              value: item,
              label: item,
            }))}></Select>
        </Wrapper>

        <Wrapper label='创意度' description='数值越大，创意度越高'>
          <Input
            type='number'
            variant='filled'
            max={1}
            min={0}
            step='0.01'
            value={data.temperature}
            name='temperature'
            onChange={(val) =>
              onNumberChange(val, 'temperature')
            }></Input>
        </Wrapper>
        <Wrapper
          label='上下文数'
          description='每次对话记忆的泪是对话次数'>
          <Input
            type='number'
            variant='filled'
            max={2000}
            min={1}
            value={data.max_log}
            name='max_log'
            onChange={(val) =>
              onNumberChange(val, 'max_log')
            }></Input>
        </Wrapper>
        <Wrapper label='回复长度' description='回复内容的长度限制'>
          <Input
            type='number'
            variant='filled'
            max={2000}
            min={50}
            step={50}
            value={data.max_tokens}
            name='max_tokens'
            onChange={(val) =>
              onNumberChange(val, 'max_tokens')
            }></Input>
        </Wrapper>
        <div className='flex justify-around mt-4'>
          <Button
            type='submit'
            leftIcon={<IconDeviceFloppy size='1.2rem' />}>
            保存
          </Button>
          {data.id ? (
            <Button
              color='red'
              leftIcon={<IconTrash size='1.2rem' />}
              onClick={() => remove(data.id as string)}>
              删除
            </Button>
          ) : null}
        </div>
      </form>
    </div>
  );
};

export default AssistantConfig;
