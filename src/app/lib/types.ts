export interface BigScrollOptions {
  count: bigint;
  size: number;
  getScrollElement: () => HTMLElement | null;
  getContentElement: () => HTMLElement | null;
  getSkeletonElement: () => HTMLElement | null;
  getStubElement: () => HTMLElement | null;
}

export interface BigScrollItem {
  index: bigint;
  id: string;
  text: string;
  start: number;
  size: number;
  image: string | null;
}

export interface BigScrollState {
  item: bigint;
  offset: number;
  lastScroll: number;
}

export interface SearchState {
  item: bigint;
  scroll: number;
  isSmooth: boolean;
}

export type CachedEntry<T extends { _id: string }> = {
  data: T | null;
  id: string;
  timestamp: number;
  isLoading: boolean;
  isPending: boolean;
};
