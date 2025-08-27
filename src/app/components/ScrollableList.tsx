"use client";
import useBigScrollVirtualizer from "../lib/helpers/useBigScrollVirtualizer";
import { useRef, useState } from "react";

export default function ScrollableList() {
  const parentRef = useRef(null);

  const [search, setSearch] = useState<bigint | null>(null);

  const bigScrollVirtualizer = useBigScrollVirtualizer({
    count: 10n ** 100n,
    scrollElement: parentRef.current,
    size: 120,
  });

  return (
    <div className="flex flex-col min-h-dvh h-dvh overflow-hidden">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          bigScrollVirtualizer.search(search!);
        }}
      >
        <label>
          Query:{" "}
          <input
            value={search?.toString() || ""}
            onChange={(e) => {
              const value = e.target.value;
              if (value) {
                if (!isNaN(Number(value))) {
                  setSearch(BigInt(value));
                }
              } else {
                setSearch(null);
              }
            }}
          />
        </label>
        <button disabled={!search}>SEARCH</button>
      </form>
      <div
        ref={parentRef}
        className="overflow-y-auto skeleton-background bg-gray-800 h-[500px]"
      >
        <div
          style={{
            height: `${bigScrollVirtualizer.totalSize}px`,
          }}
          className="w-full relative select-none overflow-hidden"
        >
          {bigScrollVirtualizer.items.map((virtualItem) => (
            <div
              key={virtualItem.index}
              style={{
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
              }}
              className="absolute top-0 left-0 w-full overflow-hidden border-white border-1 border-r-0 p-2 bg-gray-800 box-border"
            >
              <pre className="text-xl whitespace-pre-wrap break-words">
                {virtualItem.index.toString()}
              </pre>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
//opacity-0 pointer-events-none
