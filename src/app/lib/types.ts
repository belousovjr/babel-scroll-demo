export interface ScrollOptions {
  count: bigint;
  scrollElement: HTMLElement | null;
  size: number;
}

export interface ScrollItem {
  index: bigint;
  start: number;
  size: number;
}

export interface ScrollState {
  item: bigint;
  offset: number;
  lastScroll: number;
}
