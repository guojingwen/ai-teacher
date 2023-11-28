import React, { useEffect, useState } from 'react';
import { ActionIcon } from '@mantine/core';
import { IconSun, IconMoon } from '@tabler/icons-react';
import { useMantineColorScheme } from '@mantine/core';

export const ThemeSwitch = () => {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const [icon, setIcon] = useState(<IconSun />);
  useEffect(() => {
    setIcon(colorScheme === 'dark' ? <IconSun /> : <IconMoon />);
  }, [colorScheme]);
  return (
    <ActionIcon
      variant='subtle'
      size='xs'
      onClick={() =>
        toggleColorScheme(colorScheme === 'light' ? 'dark' : 'light')
      }>
      {icon}
    </ActionIcon>
  );
};
