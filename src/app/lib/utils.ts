import { ScrollItem, ScrollState, ScrollOptions } from "./types";

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

  let endIndex = startIndex + BigInt(Math.ceil(itemsPerScreen)) + overScan * 2n;
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

export function calcItemPerScroll(
  {
    scrollElement,
    size,
    count,
  }: ScrollOptions & { scrollElement: HTMLElement },
  { offset, item }: ScrollState,
  isSmooth: boolean,
  scrollTop: number,
  delta: number,
  itemsPerScreen: number
): ScrollState {
  const scrollPercent = scrollTop / scrollElement.scrollHeight;

  if (!isSmooth) {
    //calc item by scrollTop
    let currentItem: bigint;
    let newOffset: number;
    if (scrollPercent === 1) {
      currentItem = count - BigInt(Math.floor(itemsPerScreen));
      newOffset = (1 - (itemsPerScreen % 1)) * size;
    } else {
      const { numerator, denominator } = decimalToFraction(scrollPercent);
      currentItem = (count * numerator) / denominator;
      newOffset = (scrollPercent % 0.01) * 100 * size; //fake offset
    }

    return {
      item: currentItem,
      offset: newOffset,
      lastScroll: scrollTop,
    };
  } else {
    //calc item by offset
    const currentOffset = offset + delta;
    const newValue = item + BigInt(Math.trunc(currentOffset / size));

    const newOffset = currentOffset % size;

    return {
      item: newValue,
      offset: newOffset,
      lastScroll: scrollTop,
    };
  }
}
