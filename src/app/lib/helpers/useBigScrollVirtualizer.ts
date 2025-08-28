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
  roundScroll,
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
    (disable: boolean) => {
      if (!disable) {
        opts.getStubElement()?.classList.add("pointer-events-none");
      } else {
        opts.getStubElement()?.classList.remove("pointer-events-none");
      }
    },
    [opts]
  );

  const toggleVisibility = useCallback(
    (hide: boolean) => {
      for (const el of opts.getScrollElement()?.children || []) {
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
      const scrollElement = opts.getScrollElement();
      if (
        scrollElement &&
        (index !== scrollState.current.item || scrollState.current.offset)
      ) {
        let scrollTop = scrollState.current.lastScroll;
        if (checkScrollEndError(scrollElement, scrollTop)) {
          scrollTop = scrollElement.scrollHeight;
        }

        const scrollPercent = bigIntPercentage(index, opts.count);
        const itemsPerScreenInt = Math.floor(getItemsPerScreen());

        let scroll = Math.round(scrollElement.scrollHeight * scrollPercent);

        const virtualDelta =
          Number(index - scrollState.current.item) * opts.size -
          scrollState.current.offset;

        if (
          scroll === scrollElement.scrollHeight &&
          opts.count - index > itemsPerScreenInt
        ) {
          scroll =
            scrollElement.scrollHeight -
            Math.min(
              maxManualScrollDist,
              Number((opts.count - index) * BigInt(opts.size))
            );
        } else if (scroll === 0 && index !== 0n) {
          scroll = Math.min(maxManualScrollDist, Number(index) * opts.size);
        }

        const delta = scroll - scrollTop;
        if (Math.abs(virtualDelta) < getMinSmoothDist()) {
          //smooth scroll
          const isEnd = opts.count - index <= itemsPerScreenInt;

          if (!isEnd || delta) {
            scrollToState.current = {
              scroll: !isEnd
                ? scrollState.current.lastScroll + virtualDelta
                : scroll,
              item: index,
              isSmooth: true,
            };

            toggleEvents(true);

            scrollElement.scrollTo({
              top: scrollToState.current.scroll,
              behavior: "smooth",
            });
          }
        } else {
          if (delta) {
            scrollToState.current = {
              scroll,
              item: index,
              isSmooth: false,
            };

            toggleEvents(true);
            toggleVisibility(true);
            scrollElement.scrollTo({
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
    const scrollElement = opts.getScrollElement();
    if (scrollElement) {
      const scrollHandler = () => {
        let scrollTop = roundScroll(scrollElement.scrollTop);

        if (
          !(
            scrollToState.current &&
            checkScrollEndError(scrollElement, scrollToState.current.scroll)
          ) &&
          checkScrollEndError(scrollElement, scrollTop)
        ) {
          scrollTop = scrollElement.scrollHeight;
        }

        const delta =
          scrollTop - (scrollState.current?.lastScroll ?? scrollTop);

        syncAnimationAttrs(scrollElement, delta);

        let newState: ScrollState | undefined;

        if (scrollToState.current?.scroll === scrollTop) {
          if (!scrollToState.current.isSmooth) {
            newState = calcStateBySearch(opts, scrollToState.current);
          }

          toggleVisibility(false);
          toggleEvents(false);
          scrollToState.current = null;
        }

        if (
          !newState &&
          (!scrollToState.current || scrollToState.current?.isSmooth)
        ) {
          newState = calcStateByScroll(
            opts,
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
  }, [
    opts,
    updateState,
    getItemsPerScreen,
    getOverScan,
    getMinSmoothDist,
    toggleVisibility,
    toggleEvents,
  ]);

  useEffect(() => {
    if (!items.length && !isPending) {
      regenerateItems();
    }
  }, [items.length, isPending, regenerateItems]);

  return { totalSize: containerHeight, items, search };
}
