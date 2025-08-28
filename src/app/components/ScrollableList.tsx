"use client";
import { usePathname, useRouter } from "next/navigation";
import {
  bigIntToId,
  idToBigInt,
  sanitizeText,
  textToBigInt,
} from "../lib/codec";
import useBigScrollVirtualizer from "../lib/helpers/useBigScrollVirtualizer";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ScrollOptions } from "../lib/types";
import Link from "next/link";

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

  const updateIdByInex = useCallback(
    (index: bigint) => {
      const newId = bigIntToId(index);
      const params = new URLSearchParams(window.location.search);
      params.set("id", newId);
      router.replace(`${pathname}?${params.toString()}`);
      setId(newId);
    },
    [pathname, router]
  );

  useEffect(() => {
    if (parentRef.current && indexById !== null && !defIdChecked.current) {
      bigScrollVirtualizer.search(indexById, updateIdByInex);
      defIdChecked.current = true;
    }
  }, [bigScrollVirtualizer, indexById, updateIdByInex]);

  return (
    <div className="flex flex-col min-h-dvh h-dvh overflow-hidden">
      <div className="flex justify-between">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            bigScrollVirtualizer.search(textToBigInt(search), updateIdByInex);
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
        <div>
          <Link href={"/privacy-policy"}>Privacy Policy</Link> {" | "}
          <Link href={"/terms-of-use"}>Terms Of Use</Link>
        </div>
      </div>
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
