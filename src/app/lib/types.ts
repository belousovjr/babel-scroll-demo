export interface ScrollOptions {
  count: bigint;
  getScrollElement: () => HTMLElement | null;
  size: number;
}

export interface ScrollItem {
  index: bigint;
  text: string;
  start: number;
  size: number;
}

export interface ScrollState {
  item: bigint;
  offset: number;
  lastScroll: number;
}

export interface ScrollToState {
  item: bigint;
  scroll: number;
  isSmooth: boolean;
}
