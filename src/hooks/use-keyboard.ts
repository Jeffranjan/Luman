import { useHotkeys, type Options } from 'react-hotkeys-hook';

export function useKeyboard(
  keys: string,
  callback: (e: KeyboardEvent) => void,
  options?: Options
) {
  useHotkeys(keys, callback, {
    preventDefault: true,
    enableOnFormTags: false,
    ...options,
  });
}
