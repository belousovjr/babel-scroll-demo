import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import {
  genItems,
  compareScrollStates,
  syncAnimationAttrs,
  calcItemPerScroll,
} from "../utils";
import { containerHeight, overScanMax, scrollEndError } from "../constants";
import { ScrollItem, ScrollOptions, ScrollState } from "../types";

export default function useBigScrollVirtualizer({
  scrollElement,
  count,
  size,
}: ScrollOptions) {
  const [items, setItems] = useState<ScrollItem[]>([]);
  const [, startTransition] = useTransition();
  const scrollState = useRef<ScrollState>({
    item: 0n,
    offset: 0,
    lastScroll: 0,
  });

  const getItemsPerScreen = useCallback(() => {
    const height = scrollElement?.getBoundingClientRect().height || 0;
    return height / size;
  }, [scrollElement, size]);

  const getOverScan = useCallback(() => {
    return Math.min(overScanMax, Math.ceil(getItemsPerScreen()));
  }, [getItemsPerScreen]);

  const regenerateItems = useCallback(() => {
    startTransition(() => {
      setItems(
        genItems(
          {
            scrollElement,
            count,
            size,
          },
          scrollState.current,
          getItemsPerScreen(),
          BigInt(getOverScan())
        )
      );
    });
  }, [count, getItemsPerScreen, getOverScan, scrollElement, size]);

  const updateState = useCallback(
    (newState: ScrollState) => {
      if (!compareScrollStates(newState, scrollState.current)) {
        scrollState.current = newState;
        regenerateItems();
      }
    },
    [regenerateItems]
  );

  useEffect(() => {
    if (scrollElement) {
      const scrollHandler = () => {
        let scrollTop = Math.round(scrollElement.scrollTop);
        if (Math.abs(scrollTop - scrollElement.scrollHeight) < scrollEndError) {
          scrollTop = scrollElement.scrollHeight;
        }

        const perScreen = getItemsPerScreen();

        const delta =
          scrollTop - (scrollState.current?.lastScroll ?? scrollTop);

        syncAnimationAttrs(scrollElement, delta);

        const isSmooth =
          Math.abs(delta) < ((getOverScan() * 2 + perScreen) / 2) * size;

        const newState = calcItemPerScroll(
          { count, size, scrollElement },
          scrollState.current,
          isSmooth,
          scrollTop,
          delta,
          getItemsPerScreen()
        );
        updateState(newState);
      };

      scrollElement.addEventListener("scroll", scrollHandler);

      return () => {
        scrollElement.removeEventListener("scroll", scrollHandler);
      };
    }
  }, [count, scrollElement, size, updateState, getItemsPerScreen, getOverScan]);

  useEffect(() => {
    if (!items.length) {
      regenerateItems();
    }
  }, [items.length, regenerateItems]);

  return { totalSize: containerHeight, items };
}
