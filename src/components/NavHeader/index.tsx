import { Link } from 'react-router-dom';
import AssistantSelect from '../AssistantSelect';
import { ThemeSwitch } from '../ThemeSwitch';
import { Assistant, SelectSessionProps } from '@/types';
import Setting from '../Setting';
import device from '@/utils/device';
import SessionSelect from '@/components/SessionSelect';

type Props = {
  assistantId: string;
  onAssistantChange: (value: Assistant) => void;
  selectSessionProps: SelectSessionProps;
};
export default function NavHeader({
  assistantId,
  onAssistantChange,
  selectSessionProps,
}: Props) {
  return (
    <div className='flex w-full justify-between items-center p-4 shadow-sm h-[6rem]'>
      <div className='flex flex-row justify-between items-center'>
        {device.isMobile ? (
          <SessionSelect {...selectSessionProps} />
        ) : null}
        <AssistantSelect
          value={assistantId}
          onChange={onAssistantChange}
        />
        <Link to='/assistant' className='no-underline text-green-600'>
          管理
        </Link>
      </div>

      <div className='flex w-12 flex-row justify-between items-center'>
        <ThemeSwitch></ThemeSwitch>
        <Setting></Setting>
      </div>
    </div>
  );
}
