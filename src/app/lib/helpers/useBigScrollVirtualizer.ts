import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import {
  genItems,
  compareBigScrollStates,
  syncAnimationAttrs,
  calcStateByScroll,
  bigIntPercentage,
  checkScrollEndError,
  calcItemsPerScreen,
  calcStateBySearch,
  roundScroll,
  calcVirtualDelta,
} from "../utils";
import {
  containerHeight,
  maxManualScrollDist,
  overScanMax,
} from "../constants";
import {
  BigScrollItem,
  BigScrollOptions,
  BigScrollState,
  SearchState,
} from "../types";

export default function useBigScrollVirtualizer(opts: BigScrollOptions) {
  const [items, setItems] = useState<BigScrollItem[]>([]);
  const [isPending, startTransition] = useTransition();
  const bigScrollState = useRef<BigScrollState>({
    item: 0n,
    offset: 0,
    lastScroll: 0,
  });
  const isScrollEnded = useRef(true);

  const searchState = useRef<SearchState>(null);

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
          bigScrollState.current,
          getItemsPerScreen(),
          BigInt(getOverScan())
        )
      );
    });
  }, [opts, getItemsPerScreen, getOverScan]);

  const updateState = useCallback(
    (newState: BigScrollState) => {
      if (!compareBigScrollStates(newState, bigScrollState.current)) {
        bigScrollState.current = newState;
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

  const makeScroll = useCallback(
    (top: number) => {
      requestAnimationFrame(() => {
        opts.getScrollElement()?.scrollTo({
          top,
          behavior: "smooth",
        });
      });
    },
    [opts]
  );

  const search = useCallback(
    (index: bigint) => {
      const scrollElement = opts.getScrollElement();
      if (
        scrollElement &&
        (index !== bigScrollState.current.item || bigScrollState.current.offset)
      ) {
        let scrollTop = bigScrollState.current.lastScroll;
        if (checkScrollEndError(scrollElement, scrollTop)) {
          scrollTop = scrollElement.scrollHeight;
        }

        const scrollPercent = bigIntPercentage(index, opts.count);
        const itemsPerScreenInt = Math.floor(getItemsPerScreen());

        let scroll = Math.round(scrollElement.scrollHeight * scrollPercent);

        const virtualDelta = calcVirtualDelta(
          index,
          opts,
          bigScrollState.current
        );

        const isEnd = opts.count - index <= itemsPerScreenInt;

        if (
          scrollElement.scrollHeight - scroll < maxManualScrollDist &&
          !isEnd
        ) {
          scroll =
            scrollElement.scrollHeight -
            Math.min(
              maxManualScrollDist,
              Number((opts.count - index) * BigInt(opts.size))
            );
        } else if (scroll < maxManualScrollDist && index !== 0n) {
          scroll = Math.min(maxManualScrollDist, Number(index) * opts.size);
        }

        const delta = scroll - scrollTop;
        if (Math.abs(virtualDelta) < getMinSmoothDist()) {
          //smooth scroll

          if (!isEnd || delta) {
            //no scroll with zero delta to end
            searchState.current = {
              scroll: !isEnd
                ? bigScrollState.current.lastScroll + Math.round(virtualDelta)
                : scroll,
              item: index,
              isSmooth: true,
            };

            toggleEvents(true);
            makeScroll(searchState.current.scroll);
          }
        } else {
          if (delta) {
            searchState.current = {
              scroll,
              item: index,
              isSmooth: false,
            };

            toggleEvents(true);
            toggleVisibility(true);
            makeScroll(scroll);
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
      makeScroll,
      toggleVisibility,
      updateState,
    ]
  );

  useEffect(() => {
    const scrollElement = opts.getScrollElement();
    if (scrollElement) {
      const scrollHandler = () => {
        if (typeof scrollElement.onscrollend !== "undefined") {
          isScrollEnded.current = false;
        }

        let scrollTop = roundScroll(scrollElement.scrollTop);

        if (
          !(
            searchState.current &&
            checkScrollEndError(scrollElement, searchState.current.scroll)
          ) &&
          checkScrollEndError(scrollElement, scrollTop)
        ) {
          scrollTop = scrollElement.scrollHeight;
        }

        const delta =
          scrollTop - (bigScrollState.current?.lastScroll ?? scrollTop);

        let newState: BigScrollState | undefined;

        if (searchState.current?.scroll === scrollTop) {
          if (!searchState.current.isSmooth) {
            newState = calcStateBySearch(opts, searchState.current);
          }

          toggleVisibility(false);
          toggleEvents(false);

          searchState.current = null;
        }

        if (
          !newState &&
          (!searchState.current ||
            (searchState.current?.isSmooth && isScrollEnded.current))
        ) {
          newState = calcStateByScroll(
            opts,
            bigScrollState.current,
            Math.abs(delta) <= getMinSmoothDist(),
            scrollTop,
            delta
          );
        }

        syncAnimationAttrs(
          opts,
          scrollTop,
          newState ? newState.offset : Math.random() * delta
        ); //fake scroll effect

        if (newState) {
          updateState(newState);
        }
      };

      const scrollEndHandler = () => {
        isScrollEnded.current = true;
      };

      scrollElement.addEventListener("scroll", scrollHandler);
      scrollElement.addEventListener("scrollend", scrollEndHandler);

      return () => {
        scrollElement.removeEventListener("scroll", scrollHandler);
        scrollElement.removeEventListener("scrollend", scrollEndHandler);
      };
    }
  }, [getMinSmoothDist, opts, toggleEvents, toggleVisibility, updateState]);

  useEffect(() => {
    if (!items.length && !isPending) {
      opts.getScrollElement()?.scrollTo({ top: 0, behavior: "auto" });
      regenerateItems();
    }
  }, [items.length, isPending, regenerateItems, opts]);

  return { totalSize: containerHeight, items, search };
}
