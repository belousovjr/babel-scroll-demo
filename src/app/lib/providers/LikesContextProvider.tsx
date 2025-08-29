import {
  createContext,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { CachedEntry } from "../types";
import CachedEntriesProvider from "../CachedEntriesProvider";
import { getLikeDataItemsAction } from "@/app/actions";
import { LikeData } from "../db/models/Like";
import useLocalStorage from "../helpers/useLocalStorage";

export const LikesContext = createContext<{
  list: Map<string, CachedEntry<LikeData>>;
  checkItems?: (ids: string[]) => void;
  fetchItems?: (ids: string[]) => void;
}>({ list: new Map() });

export default function LikesContextProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [savedItems, setSavedItems] = useLocalStorage<CachedEntry<LikeData>[]>(
    "LIKES_DATA",
    []
  );

  const provider = useRef<CachedEntriesProvider<LikeData> | null>(null);

  const [list, setList] = useState(new Map<string, CachedEntry<LikeData>>());
  const [, startTransition] = useTransition();

  const checkItems = useCallback((ids: string[]) => {
    provider.current?.checkItems(ids);
  }, []);

  const fetchItems = useCallback((ids: string[]) => {
    return provider.current?.checkItems(ids, true);
  }, []);

  useEffect(() => {
    if (!provider.current) {
      provider.current = new CachedEntriesProvider<LikeData>(
        getLikeDataItemsAction,
        {
          defaultItems: savedItems || [],
        }
      );
    }
    const updateCallback = (items: Map<string, CachedEntry<LikeData>>) => {
      startTransition(() => {
        setList(new Map(items));
      });
      if (provider.current && !provider.current.isPending) {
        setSavedItems(provider.current.entries());
      }
    };
    provider.current.on(updateCallback);
    const callbackCleaner = provider.current;
    return () => {
      callbackCleaner.off(updateCallback);
    };
  }, [savedItems, setSavedItems]);

  return (
    <LikesContext value={{ list, checkItems, fetchItems }}>
      {children}
    </LikesContext>
  );
}
