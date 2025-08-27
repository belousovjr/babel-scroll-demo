"use client";
import useBigScroll from "../lib/helpers/useBigScrollVirtualizer";
import { useRef } from "react";

export default function ScrollableList() {
  const parentRef = useRef(null);

  const rowVirtualizer = useBigScroll({
    count: 10n ** 100n,
    scrollElement: parentRef.current,
    size: 120,
  });

  return (
    <div className="flex flex-col min-h-dvh h-dvh overflow-hidden">
      <div>ACTIONS</div>
      <div
        ref={parentRef}
        className="overflow-y-auto skeleton-background bg-gray-800"
      >
        <div
          style={{
            height: rowVirtualizer.totalSize,
          }}
          className="w-full relative select-none"
        >
          {rowVirtualizer.items.map((virtualItem) => (
            <div
              key={virtualItem.index}
              style={{
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
              }}
              className="absolute top-0 left-0 w-full overflow-hidden border-white border-1 border-r-0 p-2 bg-gray-800"
            >
              <pre className="text-xl whitespace-pre-wrap break-words">
                {(virtualItem.index + 1n).toString()}
              </pre>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
//opacity-0
