"use client";

import { idToBigInt, textToBigInt } from "../lib/codec";
import useBigScrollVirtualizer from "../lib/helpers/useBigScrollVirtualizer";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { BigScrollOptions } from "../lib/types";
import Link from "next/link";
import AuthForm from "./AuthForm";
import ListItem from "./ListItem";
import useCustomQueryParams from "../lib/helpers/useCustomQueryParams";
import { Modal, Textfield } from "@belousovjr/uikit";
import { SearchIcon } from "lucide-react";
import { genItemData } from "../lib/utils";
import ItemImage from "./ItemImage";

export default function ScrollableList() {
  const parentRef = useRef<HTMLDivElement>(null);
  const skeletonRef = useRef<HTMLDivElement>(null);
  const stubRef = useRef<HTMLDivElement>(null);
  const params = useCustomQueryParams();
  const urlId = params?.get("id");
  const [currentIndex, setCurrentIndex] = useState<bigint>();
  const [, startTransition] = useTransition();

  const [modelId, setModelId] = useState<string | null>(null);
  const isDefaultScrolled = useRef(false);

  const modalData = useMemo(
    () => (modelId ? genItemData(idToBigInt(modelId)) : null),
    [modelId]
  );

  const bigScrollVirtualizer = useBigScrollVirtualizer(
    useMemo<BigScrollOptions>(
      () => ({
        count: 27n ** 80n,
        size: 147,
        getScrollElement: () => parentRef.current,
        getSkeletonElement: () => skeletonRef.current,
        getStubElement: () => stubRef.current,
      }),
      []
    )
  );

  const updateSearchState = useCallback(
    (index: bigint) => {
      startTransition(() => {
        setCurrentIndex(index);
      });
      bigScrollVirtualizer.search(index);
    },
    [bigScrollVirtualizer]
  );

  useEffect(() => {
    if (urlId && !isDefaultScrolled.current) {
      updateSearchState(idToBigInt(urlId));
      isDefaultScrolled.current = true;
      setModelId(urlId);
    }
  }, [bigScrollVirtualizer, updateSearchState, urlId]);

  return (
    <div>
      <div className="flex flex-col min-h-dvh h-dvh overflow-hidden">
        <div className="flex flex-wrap justify-between">
          <form
            action={(formData) => {
              const { search } = Object.fromEntries(formData) as object as {
                search: string;
              };
              const index = textToBigInt(search);
              updateSearchState(index);
            }}
          >
            <Textfield
              maxLength={80}
              name="search"
              size="sm"
              placeholder="Search"
              leftIcon={<SearchIcon />}
            />
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
            className="flex justify-center overflow-y-auto min-h-full w-full"
          >
            <div className="absolute top-0 h-full w-full max-w-[600px] outline-1 outline-general-50"></div>
            <div
              style={{
                height: `${bigScrollVirtualizer.totalSize}px`,
              }}
              className="w-full max-w-[600px] relative select-none"
            >
              <div
                ref={skeletonRef}
                className="absolute top-0 skeleton-background h-full w-full max-w-[600px]"
              ></div>
              {bigScrollVirtualizer.items.map((virtualItem) => (
                <ListItem
                  key={virtualItem.index}
                  {...virtualItem}
                  isSelected={virtualItem.index === currentIndex}
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
          />
        </div>
      </div>
      <Modal
        isOpen={!!modalData}
        onClose={() => {
          setModelId(null);
        }}
        className="w-[568px] min-h-[210px] grid gap-5 pt-9"
      >
        <pre className="whitespace-pre-wrap break-words max-w-full font-sans overflow-hidden">
          {modalData?.text.trim()}
        </pre>
        {modalData?.image && (
          <ItemImage src={modalData.image} className="w-full" />
        )}
      </Modal>
    </div>
  );
}
