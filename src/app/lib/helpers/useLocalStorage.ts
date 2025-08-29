import { useEffect, useState } from "react";

export default function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T | null>(() => {
    if (typeof window !== "undefined") {
      const defaultItem = window.localStorage.getItem(key);
      if (defaultItem) {
        return JSON.parse(defaultItem);
      }
    }
    return initialValue;
  });

  useEffect(() => {
    try {
      const item = localStorage.getItem(key);
      if (item) {
        setValue(JSON.parse(item));
      }
    } catch (e) {
      console.log(e);
    }
  }, [key]);

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.log(e);
    }
  }, [key, value]);

  return [value, setValue] as const;
}
