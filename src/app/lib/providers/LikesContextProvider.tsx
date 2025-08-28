import {
  createContext,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { CacheEntry } from "../types";
import CachedEntriesProvider from "../CachedEntriesProvider";
import { getLikeDataItemsAction } from "@/app/actions";
import { LikeData } from "../db/models/Like";

export const LikesContext = createContext<{
  list: Map<string, CacheEntry<LikeData>>;
  checkItems?: (ids: string[]) => void;
  fetchItems?: (ids: string[]) => void;
}>({ list: new Map() });

export default function LikesContextProvider({
  children,
}: {
  children: ReactNode;
}) {
  const provider = useRef(
    new CachedEntriesProvider<LikeData>(getLikeDataItemsAction)
  );

  const [list, setList] = useState(new Map<string, CacheEntry<LikeData>>());

  const checkItems = useCallback((ids: string[]) => {
    provider.current.checkItems(ids);
  }, []);

  const fetchItems = useCallback((ids: string[]) => {
    return provider.current.checkItems(ids, true);
  }, []);

  useEffect(() => {
    const updateCallback = (items: Map<string, CacheEntry<LikeData>>) => {
      setList(new Map(items));
    };
    provider.current.on(updateCallback);
    return () => {
      provider.current.off(updateCallback);
    };
  }, []);

  return (
    <LikesContext value={{ list, checkItems, fetchItems }}>
      {children}
    </LikesContext>
  );
}
