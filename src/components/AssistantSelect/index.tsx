import React, { useEffect, useState } from 'react';
import { Select } from '@mantine/core';
import { Assistant, AssistantList } from '@/types';
import * as assistantStore from '@/dbs/assistantStore';
type Props = {
  value: string;
  loading?: boolean;
  onChange: (value: Assistant) => void;
};
export default function AssistantSelect({
  value,
  loading = false,
  onChange,
}: Props) {
  const [list, setList] = useState<AssistantList>([]);
  useEffect(() => {
    assistantStore.getList().then(setList);
  }, []);

  const onAssistantChange = (value: string) => {
    const assistant = list.find((item) => item.id === value)!;
    localStorage.assistantId = assistant.id;
    onChange(assistant);
  };
  return (
    <Select
      size='sm'
      onChange={onAssistantChange}
      value={value}
      className='w-32 mx-2'
      disabled={loading}
      data={list.map((item) => ({
        value: item.id,
        label: item.name,
      }))}></Select>
  );
}
