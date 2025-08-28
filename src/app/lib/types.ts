import { LikeData } from "./db/models/Like";

export interface ScrollOptions {
  count: bigint;
  size: number;
  getScrollElement: () => HTMLElement | null;
  getStubElement: () => HTMLElement | null;
}

export interface ScrollItem {
  index: bigint;
  id: string;
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

export type CacheEntry<T extends { _id: string }> = {
  data: T | null;
  id: string;
  timestamp: number;
  isLoadingSUS: boolean;
  isPending: boolean;
};
