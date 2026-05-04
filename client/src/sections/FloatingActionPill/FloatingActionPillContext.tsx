import {
  createContext,
  FC,
  PropsWithChildren,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

/**
 * Set of actions/configuration that the currently visible page contributes
 * to the global FloatingActionPill component.
 *
 * A page registers its actions via the `usePageActions` hook (typically in a
 * useEffect). When the page unmounts, the actions are automatically cleared.
 */
export type PageActions = {
  /** Called when the user taps the "+" button. If undefined, the button is hidden. */
  onAdd?: () => void;
  /** Aria-label for the add button (e.g. "nouvelle liste"). */
  addAriaLabel?: string;
  /** Optional custom icon for the add button (defaults to <AddIcon />). */
  addIcon?: ReactNode;
  /** Tooltip / label shown under the add button (e.g. "Ajouter"). */
  addLabel?: string;

  /**
   * Called whenever the search query changes.
   * If undefined, the search pill icon is rendered greyed-out and not clickable.
   */
  onSearchChange?: (query: string) => void;
  /** Placeholder for the search input. */
  searchPlaceholder?: string;

  /** When true, the entire FloatingActionPill is hidden on this page. */
  hidden?: boolean;

  /**
   * Override the auto-detected active navigation item.
   * By default the pill highlights "lists" on /mylists and "tribes" on /tribes.
   */
  activeNav?: 'lists' | 'tribes' | 'none';

  /**
   * Which navigation buttons to show. Defaults to { lists: true, tribes: true }.
   * On the ListContents page for example, only `lists` is shown.
   */
  showNav?: { lists?: boolean; tribes?: boolean };
};

type FloatingActionPillContextValue = {
  actions: PageActions;
  /** True when a page has explicitly registered actions for the pill. */
  registered: boolean;
  setPageActions: (actions: PageActions) => void;
  clearPageActions: () => void;
};

const defaultValue: FloatingActionPillContextValue = {
  actions: {},
  registered: false,
  setPageActions: () => {},
  clearPageActions: () => {},
};

export const FloatingActionPillContext =
  createContext<FloatingActionPillContextValue>(defaultValue);

export const FloatingActionPillProvider: FC<PropsWithChildren> = ({ children }) => {
  const [actions, setActions] = useState<PageActions>({});
  const [registered, setRegistered] = useState(false);

  const setPageActions = useCallback((next: PageActions) => {
    setActions(next);
    setRegistered(true);
  }, []);

  const clearPageActions = useCallback(() => {
    setActions({});
    setRegistered(false);
  }, []);

  const value = useMemo(
    () => ({ actions, registered, setPageActions, clearPageActions }),
    [actions, registered, setPageActions, clearPageActions],
  );

  return (
    <FloatingActionPillContext.Provider value={value}>
      {children}
    </FloatingActionPillContext.Provider>
  );
};

export const useFloatingActionPill = () => useContext(FloatingActionPillContext);

/**
 * Convenience hook used by a page to register its action callbacks
 * for the global FloatingActionPill.
 *
 * The actions are set on mount/whenever `deps` change and cleared on unmount.
 *
 * @example
 *   usePageActions(
 *     { onAdd: handleAddGiftList, onSearchChange: setSearchQuery },
 *     [handleAddGiftList],
 *   );
 */
export const usePageActions = (actions: PageActions, deps: ReadonlyArray<unknown> = []) => {
  const { setPageActions, clearPageActions } = useFloatingActionPill();

  useEffect(() => {
    setPageActions(actions);
    return () => clearPageActions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
};
