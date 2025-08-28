export interface ScrollOptions {
  count: bigint;
  size: number;
  getScrollElement: () => HTMLElement | null;
  getStubElement: () => HTMLElement | null;
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
  callback: (index: bigint) => void;
}
