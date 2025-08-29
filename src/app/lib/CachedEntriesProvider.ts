import { CachedEntry } from "./types";

interface CachedEntriesProviderOptions<T extends { _id: string }> {
  defaultItems?: CachedEntry<T>[];
}

export default class CachedEntriesProvider<T extends { _id: string }> {
  #byTimestamp: CachedEntry<T>[] = [];
  #byId = new Map<string, CachedEntry<T>>();
  public cacheTime = 30 * 1000;
  public max = 2000;
  #fetchFn: (ids: string[]) => Promise<T[]>;
  #callbacks = new Set<(items: Map<string, CachedEntry<T>>) => unknown>();
  #plannedIds = new Set<string>();

  get isPending() {
    return this.#byTimestamp.some((item) => item.isPending);
  }

  constructor(
    fetchFn: (ids: string[]) => Promise<T[]>,
    options?: CachedEntriesProviderOptions<T>
  ) {
    this.#fetchFn = fetchFn;

    if (options?.defaultItems?.length) {
      const filteredDefItems = options.defaultItems.filter(
        (item) => !this.#checkIsOldCache(item)
      );
      this.#byTimestamp = [...filteredDefItems];
      for (const item of filteredDefItems) {
        this.#byId.set(item.id, item);
      }
      this.#fixSize();
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
  #checkIsOldCache(item: CachedEntry<T> | undefined) {
    return !item || Date.now() - item.timestamp > this.cacheTime;
  }
  #setOrUpdateItem(itemData: CachedEntry<T>) {
    const oldItem = this.#byId.get(itemData.id);
    if (oldItem) {
      oldItem.data = itemData.data;
      oldItem.isPending = itemData.isPending;
      oldItem.isLoading = itemData.isLoading;
      oldItem.timestamp = itemData.timestamp;
    }
    return { oldItem, newItem: oldItem || itemData };
  }
  #setOrUpdate(items: T[], emptyIds: string[]) {
    const timestamp = Date.now();
    for (const id of emptyIds) {
      const { newItem, oldItem } = this.#setOrUpdateItem({
        id,
        data: null,
        isPending: false,
        isLoading: false,
        timestamp,
      });

      if (oldItem) {
        const index = this.#byTimestamp.indexOf(oldItem);
        this.#byTimestamp.splice(index, 1);
      }

      this.#byTimestamp.push(newItem);
      this.#byId.set(id, newItem);
    }

    for (const item of items) {
      const id = item._id;

      const { oldItem, newItem } = this.#setOrUpdateItem({
        data: item,
        id,
        isPending: false,
        isLoading: false,
        timestamp,
      });
      if (oldItem) {
        const index = this.#byTimestamp.indexOf(oldItem);
        this.#byTimestamp.splice(index, 1);
      }

      this.#byTimestamp.push(newItem);
      this.#byId.set(id, newItem);
    }

    this.#fixSize();
  }
  #emit() {
    for (const callback of this.#callbacks) {
      callback(this.#byId);
    }
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
  on(callback: (items: Map<string, CachedEntry<T>>) => unknown) {
    this.#callbacks.add(callback);
  }
  off(callback: (items: Map<string, CachedEntry<T>>) => unknown) {
    this.#callbacks.delete(callback);
  }
  checkItems(ids: string[], force?: false): void;
  checkItems(ids: string[], force: true): Promise<void>;
  checkItems(ids: string[], force = false): void | Promise<void> {
    const fetchIds: string[] = [];
    const timestamp = Date.now();

    for (const id of ids) {
      const item = this.#byId.get(id);
      if (!item?.isPending && (force || !item || this.#checkIsOldCache(item))) {
        fetchIds.push(id);
        this.#plannedIds.add(id);
        if (item) {
          item.isPending = true;
        } else {
          const newItem: CachedEntry<T> = {
            isPending: true,
            isLoading: true,
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
      setInterval(() => {
        this.#fetch();
      }, 100);
    } else {
      return this.#fetch(ids);
    }
  }
  entries() {
    return [...this.#byTimestamp];
  }
}
