"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { idToBigInt, sanitizeText, textToBigInt, textToId } from "../lib/codec";
import useBigScrollVirtualizer from "../lib/helpers/useBigScrollVirtualizer";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export default function ScrollableList() {
  const parentRef = useRef(null);
  const defIdChecked = useRef(false);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState("");

  const id = searchParams.get("id");

  const bigScrollVirtualizer = useBigScrollVirtualizer(
    useMemo(
      () => ({
        count: 27n ** 80n,
        size: 120,
        getScrollElement: () => parentRef.current,
      }),
      []
    )
  );

  const indexById = useMemo(() => (id ? idToBigInt(id) : null), [id]);

  const updateId = useCallback(
    (newId: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("id", newId);

      router.replace(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams]
  );

  useEffect(() => {
    if (parentRef.current && indexById !== null && !defIdChecked.current) {
      bigScrollVirtualizer.search(indexById);
      defIdChecked.current = true;
    }
  }, [bigScrollVirtualizer, indexById, searchParams]);

  return (
    <div className="flex flex-col min-h-dvh h-dvh overflow-hidden">
      <form
        onSubmit={(e) => {
          e.preventDefault();

          updateId(textToId(search));
          bigScrollVirtualizer.search(textToBigInt(search));
        }}
      >
        <label>
          Query:{" "}
          <input
            value={search?.toString() || ""}
            onChange={(e) => {
              setSearch(sanitizeText(e.target.value));
            }}
            maxLength={80}
          />
        </label>{" "}
        <button>SEARCH</button>
      </form>
      <div
        ref={parentRef}
        className="overflow-y-auto skeleton-background bg-gray-800"
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
              className={`absolute top-0 left-0 w-full overflow-hidden border-white border-1 border-r-0 p-2 bg-gray-800 box-border transition-colors ${
                indexById === virtualItem.index
                  ? "bg-yellow-500 text-black"
                  : ""
              }`}
            >
              <pre className="text-xl whitespace-pre-wrap break-words">
                {virtualItem.text}
              </pre>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
//opacity-0 pointer-events-none
