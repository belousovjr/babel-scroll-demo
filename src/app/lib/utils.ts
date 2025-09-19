import { bigIntToId, bigIntToText } from "./codec";
import {
  BigScrollItem,
  BigScrollState,
  BigScrollOptions,
  SearchState,
} from "./types";

import { isGibberish } from "@agarimo/gibberish";

export function genItemData(
  index: bigint
): Omit<BigScrollItem, "size" | "start"> {
  const text = bigIntToText(index);
  const trimText = text.trimEnd();
  const lastWorld = trimText.split(" ").at(-1)!;
  const withImage =
    !!trimText &&
    !/ {2,}/.test(trimText) &&
    !isGibberish(trimText) &&
    !isGibberish(`word ${lastWorld}`);

  const year = pseudoRandomInt(index, 1990, 600);
  const createdYear = pseudoRandomInt(index, year - 13, year - 80);
  const usernameIndex = pseudoRandomInt(index, 3422, 9999);
  const names = [
    "Ishtar",
    "Enki",
    "Gilga",
    "Marduk",
    "Zigg",
    "Hammu",
    "Sumer",
    "Shama",
    "Enlil",
    "Erech",
  ];
  const lastNames = ["Pulse", "Boss", "Day", "Boy", "Aura", "Vibes", ""];

  return {
    index,
    id: bigIntToId(index),
    text,
    image: withImage
      ? `https://image.pollinations.ai/prompt/${text.trim()}?width=512&height=256&seed=43&nologo=true`
      : null,
    username: `bbs${usernameIndex}`,
    nickname: [
      names[pseudoRandomInt(index, 0, names.length - 1)],
      lastNames[pseudoRandomInt(index, 0, lastNames.length - 1)],
      year,
    ].join(""),
    createdAt: createdYear.toString(),
  };
}

export function genItems(
  oldItems: BigScrollItem[],
  { count, size }: BigScrollOptions,
  { item, lastScroll, offset }: BigScrollState,
  itemsPerScreen: number,
  overScan: bigint
): BigScrollItem[] {
  const newItems: BigScrollItem[] = [];
  let startIndex = item - overScan;

  const itemsPerScreenBigInt = BigInt(Math.ceil(itemsPerScreen));

  if (startIndex < 0n) {
    startIndex = 0n;
  }

  let endIndex = startIndex + overScan * 2n + itemsPerScreenBigInt;
  if (endIndex > count) {
    endIndex = count;
  }

  const firstOldIndex = oldItems[0]?.index ?? null;

  for (let i = startIndex; i < endIndex; i += 1n) {
    const oldItem = firstOldIndex && oldItems[Number(i - firstOldIndex)];
    if (oldItem) {
      newItems.push(oldItem);
    } else {
      const start = lastScroll + Number(i - item) * size - offset;
      newItems.push({
        ...genItemData(i),
        start,
        size,
      });
    }
  }

  return newItems;
}

export function compareBigScrollStates(a: BigScrollState, b: BigScrollState) {
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

export function syncAnimationAttrs(
  opts: BigScrollOptions,
  scrollTop: number,
  offset: number
) {
  const scrollElement = opts.getScrollElement();
  const contentElement = opts.getContentElement();
  const skeletonElement = opts.getSkeletonElement();
  if (scrollElement && contentElement && skeletonElement) {
    scrollElement.style.backgroundPositionY = `${
      80 - (1 - scrollTop / scrollElement.scrollHeight) * 20
    }%, center`;

    if (scrollTop === opts.getScrollElement()?.scrollHeight) {
      contentElement.style.backgroundPositionY = `${scrollTop}px`;
      skeletonElement.style.backgroundPositionY = `${
        (calcItemsPerScreen(opts) % 1) * opts.size
      }px`;
    } else {
      contentElement.style.backgroundPositionY = `${scrollTop - offset}px`;
      skeletonElement.style.backgroundPositionY = `${-offset}px`;
    }
  }
}

export function calcItemsPerScreen({
  getScrollElement,
  size,
}: BigScrollOptions) {
  const height = getScrollElement()?.getBoundingClientRect().height || 0;
  return height / size;
}

export function calcStateForEnd(opts: BigScrollOptions): BigScrollState {
  const itemsPerScreen = calcItemsPerScreen(opts);
  const lastScroll = roundScroll(opts.getScrollElement()!.scrollTop);
  return {
    offset: -(itemsPerScreen % 1) * opts.size,
    item: opts.count - BigInt(Math.floor(itemsPerScreen)),
    lastScroll,
  };
}

export function calcStateByScroll(
  opts: BigScrollOptions,
  { offset, item }: BigScrollState,
  isSmooth: boolean,
  scrollTop: number,
  delta: number
): BigScrollState {
  const scrollElement = opts.getScrollElement()!;
  if (!isSmooth) {
    const lastScroll = roundScroll(scrollElement.scrollTop);
    //calc item by scrollTop
    if (scrollTop === scrollElement.scrollHeight) {
      return calcStateForEnd(opts);
    } else {
      const scrollPercent = scrollTop / scrollElement.scrollHeight;
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
  opts: BigScrollOptions,
  state: SearchState
): BigScrollState {
  if (state.scroll === opts.getScrollElement()!.scrollHeight) {
    return calcStateForEnd(opts);
  } else {
    return {
      item: state.item,
      offset: 0,
      lastScroll: state.scroll,
    };
  }
}

export function checkScrollEndError(element: HTMLElement, scroll: number) {
  const diff = element.scrollHeight - scroll;
  const scrollEndError = Math.ceil(element.getBoundingClientRect().height);
  return diff && diff <= scrollEndError;
}

export function roundScroll(value: number) {
  const floor = Math.floor(value);
  const diff = value - floor;

  if (diff > 0.5) return floor + 1;
  return floor;
}

export function calcVirtualDelta(
  index: bigint,
  opts: BigScrollOptions,
  { offset, item }: BigScrollState
) {
  return Number(index - item) * opts.size - offset;
}

export function genLink(id: string) {
  return `${window.location.origin}?id=${id}`;
}

export function pseudoRandomInt(value: bigint, min = 0, max = 1) {
  let seed = value * 668265263n;
  seed = (seed ^ (seed >> 13n)) * 1274126177n;
  seed = seed ^ (seed >> 16n);

  const normalized = Number(seed & 0xffffffffn) / 4294967295;
  return Math.round(min + (max - min) * normalized);
}
