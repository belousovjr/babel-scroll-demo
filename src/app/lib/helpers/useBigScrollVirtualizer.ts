import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import {
  genItems,
  compareScrollStates,
  syncAnimationAttrs,
  calcStateByScroll,
  bigIntPercentage,
  checkScrollEndError,
  calcItemsPerScreen,
  calcStateBySearch,
} from "../utils";
import {
  containerHeight,
  maxManualScrollDist,
  overScanMax,
} from "../constants";
import {
  ScrollItem,
  ScrollOptions,
  ScrollState,
  ScrollToState,
} from "../types";

export default function useBigScrollVirtualizer(opts: ScrollOptions) {
  const [items, setItems] = useState<ScrollItem[]>([]);
  const [isPending, startTransition] = useTransition();
  const scrollState = useRef<ScrollState>({
    item: 0n,
    offset: 0,
    lastScroll: 0,
  });

  const scrollToState = useRef<ScrollToState>(null);

  const getItemsPerScreen = useCallback(() => {
    return calcItemsPerScreen(opts);
  }, [opts]);

  const getOverScan = useCallback(() => {
    return Math.min(overScanMax, Math.ceil(getItemsPerScreen()) * 2);
  }, [getItemsPerScreen]);

  const getMinSmoothDist = useCallback(() => {
    return Math.floor(
      ((getOverScan() * 2 + getItemsPerScreen()) / 2) * opts.size
    );
  }, [getItemsPerScreen, getOverScan, opts]);

  const regenerateItems = useCallback(() => {
    startTransition(() => {
      setItems(
        genItems(
          opts,
          scrollState.current,
          getItemsPerScreen(),
          BigInt(getOverScan())
        )
      );
    });
  }, [opts, getItemsPerScreen, getOverScan]);

  const updateState = useCallback(
    (newState: ScrollState) => {
      if (!compareScrollStates(newState, scrollState.current)) {
        scrollState.current = newState;
        regenerateItems();
      }
    },
    [regenerateItems]
  );

  const toggleEvents = useCallback(
    (none: boolean) => {
      if (none) {
        opts.scrollElement?.classList.add("pointer-events-none");
      } else {
        opts.scrollElement?.classList.remove("pointer-events-none");
      }
    },
    [opts]
  );

  const toggleVisibility = useCallback(
    (hide: boolean) => {
      for (const el of opts.scrollElement?.children || []) {
        if (hide) {
          el.classList.add("opacity-0");
        } else {
          el.classList.remove("opacity-0");
        }
      }
    },
    [opts]
  );

  const search = useCallback(
    (index: bigint) => {
      if (
        opts.scrollElement &&
        (index !== scrollState.current.item || scrollState.current.offset)
      ) {
        const scrollTop = Math.trunc(opts.scrollElement.scrollTop);
        const scrollPercent = bigIntPercentage(index, opts.count);
        const itemsPerScreenInt = Math.floor(getItemsPerScreen());

        let scroll = Math.trunc(
          opts.scrollElement.scrollHeight * scrollPercent
        );
        const virtualDelta =
          Number(index - scrollState.current.item) * opts.size -
          scrollState.current.offset;

        if (
          scroll === opts.scrollElement.scrollHeight &&
          opts.count - index > itemsPerScreenInt
        ) {
          scroll =
            opts.scrollElement.scrollHeight -
            Math.min(
              maxManualScrollDist,
              Number((opts.count - index) * BigInt(opts.size))
            );
        } else if (scroll === 0 && index !== 0n) {
          scroll = Math.min(maxManualScrollDist, Number(index) * opts.size);
        }

        const delta = scroll - scrollTop;
        if (Math.abs(virtualDelta) < getMinSmoothDist()) {
          scrollToState.current = {
            scroll: scrollState.current.lastScroll + virtualDelta,
            item: index,
            isSmooth: true,
          };

          toggleEvents(true);
          opts.scrollElement.scrollTo({
            top: scrollToState.current.scroll,
            behavior: "smooth",
          });
        } else {
          if (delta) {
            scrollToState.current = {
              scroll,
              item: index,
              isSmooth: false,
            };

            toggleEvents(true);
            toggleVisibility(true);
            opts.scrollElement.scrollTo({
              top: scroll,
              behavior: "smooth",
            });
          } else {
            updateState({
              item: index,
              offset: 0,
              lastScroll: scrollTop,
            });
          }
        }
      }
    },
    [
      opts,
      getItemsPerScreen,
      getMinSmoothDist,
      toggleEvents,
      toggleVisibility,
      updateState,
    ]
  );

  useEffect(() => {
    if (items.length && !isPending) {
      toggleVisibility(false);
      toggleEvents(false);
    }
  }, [isPending, items.length, toggleEvents, toggleVisibility]);

  useEffect(() => {
    const { scrollElement, count, size } = opts;
    if (scrollElement) {
      const scrollHandler = () => {
        let scrollTop = Math.trunc(scrollElement.scrollTop);

        if (
          !(
            scrollToState.current &&
            checkScrollEndError(
              scrollElement.scrollHeight,
              scrollToState.current.scroll
            )
          ) &&
          checkScrollEndError(scrollElement.scrollHeight, scrollTop)
        ) {
          scrollTop = scrollElement.scrollHeight;
        }

        const delta =
          scrollTop - (scrollState.current?.lastScroll ?? scrollTop);

        syncAnimationAttrs(scrollElement, delta);

        let newState: ScrollState | undefined;

        if (scrollToState.current?.scroll === scrollTop) {
          if (!scrollToState.current.isSmooth) {
            newState = calcStateBySearch(
              { scrollElement, count, size },
              scrollToState.current
            );
          }
          scrollToState.current = null;
        }

        if (
          !newState &&
          (!scrollToState.current || scrollToState.current?.isSmooth)
        ) {
          newState = calcStateByScroll(
            { count, size, scrollElement },
            scrollState.current,
            Math.abs(delta) <= getMinSmoothDist(),
            scrollTop,
            delta
          );
        }
        if (newState) {
          updateState(newState);
        }
      };

      scrollElement.addEventListener("scroll", scrollHandler);

      return () => {
        scrollElement.removeEventListener("scroll", scrollHandler);
      };
    }
  }, [opts, updateState, getItemsPerScreen, getOverScan, getMinSmoothDist]);

  useEffect(() => {
    if (!items.length) {
      regenerateItems();
    }
  }, [items.length, regenerateItems]);

  return { totalSize: containerHeight, items, search };
}
