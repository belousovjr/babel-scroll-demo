"use client";
import { usePathname, useRouter } from "next/navigation";
import { idToBigInt, sanitizeText, textToBigInt, textToId } from "../lib/codec";
import useBigScrollVirtualizer from "../lib/helpers/useBigScrollVirtualizer";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ScrollOptions } from "../lib/types";

export default function ScrollableList() {
  const parentRef = useRef<HTMLDivElement>(null);
  const stubRef = useRef<HTMLDivElement>(null);
  const defIdChecked = useRef(false);

  const router = useRouter();
  const pathname = usePathname();

  const [search, setSearch] = useState("");
  const params = new URLSearchParams(
    typeof window !== "undefined" ? window.location.search : ""
  );
  const [id, setId] = useState(params.get("id"));

  const bigScrollVirtualizer = useBigScrollVirtualizer(
    useMemo<ScrollOptions>(
      () => ({
        count: 27n ** 80n,
        size: 120,
        getScrollElement: () => parentRef.current,
        getStubElement: () => stubRef.current,
      }),
      []
    )
  );
  const indexById = useMemo(() => (id ? idToBigInt(id) : null), [id]);

  const updateId = useCallback(
    (newId: string) => {
      const params = new URLSearchParams(window.location.search);
      params.set("id", newId);
      router.replace(`${pathname}?${params.toString()}`);
      setId(newId);
    },
    [pathname, router]
  );

  useEffect(() => {
    if (parentRef.current && indexById !== null && !defIdChecked.current) {
      bigScrollVirtualizer.search(indexById);
      defIdChecked.current = true;
    }
  }, [bigScrollVirtualizer, indexById]);

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
      <div className="relative flex-1 flex flex-col overflow-hidden">
        <div
          ref={parentRef}
          className="overflow-y-auto skeleton-background min-h-full bg-gray-800"
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
                    ? "bg-yellow-600 text-black font-bold"
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
        <div
          ref={stubRef}
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
        ></div>
      </div>
    </div>
  );
}
//opacity-0 pointer-events-none
