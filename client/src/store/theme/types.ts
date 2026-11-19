import type { Themes } from '@/theme/types';

type Actions = {
  toggle: () => void;
  setMode: (mode: Themes) => void;
};

export type { Actions };
