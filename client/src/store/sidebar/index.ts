import { useCallback, useMemo } from 'react';
import { atom, useAtom } from 'jotai';

import type { Actions } from './types';

const sidebarIsOpenState = atom<boolean>(false);

function useSidebar(): [boolean, Actions] {
  const [isOpen, setIsOpen] = useAtom(sidebarIsOpenState);

  const toggle = useCallback(() => {
    setIsOpen((isOpen: boolean) => !isOpen);
  }, [setIsOpen]);

  const close = useCallback(() => {
    setIsOpen(false);
  }, [setIsOpen]);

  const open = useCallback(() => {
    setIsOpen(true);
  }, [setIsOpen]);

  const memoizedActions = useMemo(() => ({ toggle, close, open }), [toggle, close, open]);

  return [isOpen, memoizedActions];
}

export default useSidebar;
