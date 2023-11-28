import { useRef, useState } from 'react';

export const useGetState = <T = any>(
  initVal: T
): [T, (arg: T) => void, () => T] => {
  const [state, setState] = useState(initVal);
  const ref = useRef(initVal);
  const _setState = (newVal: T) => {
    ref.current = newVal;
    setState(newVal);
  };
  const getState = (): T => {
    return ref.current;
  };
  return [state, _setState, getState];
};
