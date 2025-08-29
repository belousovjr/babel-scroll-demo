"use client";

import { idToBigInt, prepText, sanitizeText, textToBigInt } from "../lib/codec";
import useBigScrollVirtualizer from "../lib/helpers/useBigScrollVirtualizer";
import { useEffect, useMemo, useRef, useState } from "react";
import { BigScrollOptions } from "../lib/types";
import Link from "next/link";
import AuthForm from "./AuthForm";
import ListItem from "./ListItem";
import ItemModal from "./ItemModal";
import useCustomQueryParams from "../lib/helpers/useCustomQueryParams";

export default function ScrollableList() {
  const parentRef = useRef<HTMLDivElement>(null);
  const stubRef = useRef<HTMLDivElement>(null);
  const params = useCustomQueryParams();
  const urlId = params?.get("id");

  const [search, setSearch] = useState("");
  const [modelId, setModelId] = useState<string | null>(null);
  const isDefaultScrolled = useRef(false);

  const prepSearch = useMemo(() => {
    return prepText(search);
  }, [search]);

  const bigScrollVirtualizer = useBigScrollVirtualizer(
    useMemo<BigScrollOptions>(
      () => ({
        count: 27n ** 80n,
        size: 120,
        getScrollElement: () => parentRef.current,
        getStubElement: () => stubRef.current,
      }),
      []
    )
  );

  useEffect(() => {
    if (urlId && !isDefaultScrolled.current) {
      bigScrollVirtualizer.search(idToBigInt(urlId));
      isDefaultScrolled.current = true;
      setModelId(urlId);
    }
  }, [bigScrollVirtualizer, urlId]);

  return (
    <div>
      <div className="flex flex-col min-h-dvh h-dvh overflow-hidden">
        <div className="flex flex-wrap justify-between">
          <form
            onSubmit={(e) => {
              e.preventDefault();
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
          <AuthForm />
          <div>
            <Link href={"/privacy-policy"}>Privacy Policy</Link> {" | "}
            <Link href={"/terms-of-use"}>Terms Of Use</Link>
          </div>
        </div>
        <div className="relative flex-1 flex flex-col overflow-hidden">
          <div
            ref={parentRef}
            className="overflow-y-auto min-h-full bg-gray-800 skeleton-background"
          >
            <div
              style={{
                height: `${bigScrollVirtualizer.totalSize}px`,
              }}
              className="w-full relative select-none overflow-hidden"
            >
              {bigScrollVirtualizer.items.map((virtualItem) => (
                <ListItem
                  key={virtualItem.index}
                  data={virtualItem}
                  isSelected={virtualItem.text === prepSearch}
                  onClick={() => {
                    setModelId(virtualItem.id);
                  }}
                />
              ))}
            </div>
          </div>
          <div
            ref={stubRef}
            className="absolute top-0 left-0 w-full h-full pointer-events-none"
          ></div>
        </div>
      </div>
      {modelId && (
        <ItemModal
          id={modelId}
          close={() => {
            setModelId(null);
          }}
        />
      )}
    </div>
  );
}
//opacity-0 pointer-events-none
