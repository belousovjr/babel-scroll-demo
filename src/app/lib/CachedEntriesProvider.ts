import { CacheEntry } from "./types";

interface CachedEntriesProviderOptions {
  defaultIds?: string[];
}

export default class CachedEntriesProvider<T extends { _id: string }> {
  #byTimestamp: CacheEntry<T>[] = [];
  #byId = new Map<string, CacheEntry<T>>();
  public cacheTime = 60 * 1000;
  public max = 5000;
  #fetchFn: (ids: string[]) => Promise<T[]>;
  #callbacks = new Set<(items: Map<string, CacheEntry<T>>) => unknown>();
  #plannedIds = new Set<string>();
  #debounceInterval: NodeJS.Timeout | null = null;

  constructor(
    fetchFn: (ids: string[]) => Promise<T[]>,
    options?: CachedEntriesProviderOptions
  ) {
    this.#fetchFn = fetchFn;

    if (options?.defaultIds) {
      this.checkItems(options.defaultIds);
    }
  }

  #fixSize() {
    const diff = this.#byId.size - this.max;
    if (diff > 0) {
      const ids = this.#byTimestamp.slice(0, diff).map((item) => item.id);
      this.#byTimestamp.splice(0, diff);
      for (const id of ids) {
        this.#byId.delete(id);
      }
    }
  }
  #checkIsOldCache(item: CacheEntry<T> | undefined) {
    return !item || Date.now() - item.timestamp > this.cacheTime;
  }
  #setOrUpdate(items: T[], emptyIds: string[]) {
    const timestamp = Date.now();
    for (const id of emptyIds) {
      const oldItem = this.#byId.get(id);
      const newCachedItem: CacheEntry<T> = {
        data: null,
        id,
        isPending: false,
        isLoadingSUS: false,
        timestamp,
      };
      if (oldItem) {
        const index = this.#byTimestamp.indexOf(oldItem);
        this.#byTimestamp.splice(index, 1);
      }
      this.#byTimestamp.push(newCachedItem);
      this.#byId.set(id, newCachedItem);
    }

    for (const item of items) {
      const id = item._id;
      const oldItem = this.#byId.get(id);
      const newCachedItem: CacheEntry<T> = {
        data: item,
        id,
        isPending: false,
        isLoadingSUS: false,
        timestamp,
      };
      if (oldItem) {
        const index = this.#byTimestamp.indexOf(oldItem);
        this.#byTimestamp.splice(index, 1);
      }
      this.#byTimestamp.push(newCachedItem);

      this.#byId.set(id, newCachedItem);
    }
    this.#fixSize();
  }
  #emit() {
    for (const callback of this.#callbacks) {
      callback(this.#byId);
    }
  }
  on(callback: (items: Map<string, CacheEntry<T>>) => unknown) {
    this.#callbacks.add(callback);
  }
  off(callback: (items: Map<string, CacheEntry<T>>) => unknown) {
    this.#callbacks.delete(callback);
  }
  async #fetch(forceIds?: string[]) {
    const fetchIds = forceIds || Array.from(this.#plannedIds);
    if (fetchIds.length) {
      for (const id of fetchIds) {
        this.#plannedIds.delete(id);
      }

      const newItems = await this.#fetchFn(fetchIds);
      const emptyIds = fetchIds.filter(
        (id) => !newItems.some((item) => item._id === id)
      );

      this.#setOrUpdate(newItems, emptyIds);
      this.#emit();
    }
  }
  checkItems(ids: string[], force?: false): void;
  checkItems(ids: string[], force: true): Promise<void>;
  checkItems(ids: string[], force = false): void | Promise<void> {
    const fetchIds: string[] = [];
    const timestamp = Date.now();
    for (const id of ids) {
      const item = this.#byId.get(id);
      if (force || !item || this.#checkIsOldCache(item)) {
        fetchIds.push(id);
        this.#plannedIds.add(id);
        if (item) {
          this.#byId.set(id, { ...item, isPending: true });
        } else {
          const newItem: CacheEntry<T> = {
            isPending: true,
            isLoadingSUS: true,
            timestamp,
            id,
            data: null,
          };
          this.#byId.set(id, newItem);
          this.#byTimestamp.push(newItem);
        }
      }
    }

    this.#fixSize();
    this.#emit();

    if (!force) {
      if (this.#debounceInterval) {
        clearInterval(this.#debounceInterval);
      }

      this.#debounceInterval = setInterval(() => {
        this.#fetch();
      }, 100);
    } else {
      return this.#fetch(ids);
    }
  }
}
