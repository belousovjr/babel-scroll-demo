import { scrollEndError } from "./constants";
import { ScrollItem, ScrollState, ScrollOptions, ScrollToState } from "./types";

export function genItems(
  { count, size }: ScrollOptions,
  { item, lastScroll, offset }: ScrollState,
  itemsPerScreen: number,
  overScan: bigint
): ScrollItem[] {
  const newItems: ScrollItem[] = [];
  let startIndex = item - overScan;

  if (startIndex < 0n) {
    startIndex = 0n;
  }

  let endIndex = startIndex + overScan * 2n + BigInt(Math.ceil(itemsPerScreen));
  if (endIndex > count) {
    endIndex = count;
  }
  for (let i = startIndex; i < endIndex; i += 1n) {
    const start = lastScroll + Number(i - item) * size - offset;

    newItems.push({
      index: i,
      size,
      start,
    });
  }
  return newItems;
}

export function compareScrollStates(a: ScrollState, b: ScrollState) {
  return (
    a.item === b.item && a.lastScroll === b.lastScroll && a.offset === b.offset
  );
}

export function bigIntPercentage(a: bigint, b: bigint, digits = 18) {
  if (!a) {
    return 0;
  } else if (a === b) {
    return 1;
  }
  const scale = 10n ** BigInt(digits);
  const percent = (a * scale) / b;
  return Number(percent) / Number(scale);
}

export function decimalToFraction(x: number | string, digits = 18) {
  const str = Number(x).toFixed(digits).replace(/0+$/g, "");
  const [intPart, decPart = ""] = str.split(".");
  const precision = decPart.length;

  const denominator = 10n ** BigInt(precision);
  const numerator = BigInt(intPart + decPart);

  return { numerator, denominator };
}

export function syncAnimationAttrs(element: HTMLElement, delta: number) {
  if (!delta) {
    element.style.animationName = "none";
  } else {
    element.style.animationName = "scrollSkeleton";
    if (delta >= 0) {
      element.style.animationDirection = "reverse";
    } else {
      element.style.animationDirection = "normal";
    }
  }
}

export function calcItemsPerScreen({ scrollElement, size }: ScrollOptions) {
  const height = scrollElement?.getBoundingClientRect().height || 0;
  return height / size;
}

export function calcStateForEnd(opts: ScrollOptions): ScrollState {
  const itemsPerScreen = calcItemsPerScreen(opts);
  const lastScroll = Math.trunc(opts.scrollElement!.scrollTop);
  return {
    offset: -(itemsPerScreen % 1) * opts.size,
    item: opts.count - BigInt(Math.floor(itemsPerScreen)),
    lastScroll,
  };
}

export function calcStateByScroll(
  opts: ScrollOptions & { scrollElement: HTMLElement },
  { offset, item }: ScrollState,
  isSmooth: boolean,
  scrollTop: number,
  delta: number
): ScrollState {
  if (!isSmooth) {
    const lastScroll = Math.trunc(opts.scrollElement.scrollTop);
    //calc item by scrollTop
    if (scrollTop === opts.scrollElement.scrollHeight) {
      return calcStateForEnd(opts);
    } else {
      const scrollPercent = scrollTop / opts.scrollElement.scrollHeight;
      const { numerator, denominator } = decimalToFraction(scrollPercent);

      return {
        item: (opts.count * numerator) / denominator,
        offset: (scrollPercent % 0.01) * 100 * opts.size, //fake offset
        lastScroll,
      };
    }
  } else {
    //calc item by offset
    const currentOffset = offset + delta;
    const scrolledItems = BigInt(Math.trunc(currentOffset / opts.size));

    return {
      item: item + scrolledItems,
      offset: currentOffset % opts.size,
      lastScroll: scrollTop,
    };
  }
}

export function calcStateBySearch(
  opts: ScrollOptions & { scrollElement: HTMLElement },
  state: ScrollToState
): ScrollState {
  if (state.scroll === opts.scrollElement.scrollHeight) {
    return calcStateForEnd(opts);
  } else {
    return {
      item: state.item,
      offset: 0,
      lastScroll: state.scroll,
    };
  }
}

export function checkScrollEndError(height: number, scroll: number) {
  const diff = height - scroll;
  return diff && diff <= scrollEndError;
}
