"use client";

import { bigIntToText, idToBigInt, textToBigInt } from "../lib/codec";
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
import ListItem from "./ListItem";
import useCustomQueryParams from "../lib/helpers/useCustomQueryParams";
import { Button, Modal } from "@belousovjr/uikit";
import { LinkIcon } from "lucide-react";
import { genItemData, genLink } from "../lib/utils";
import ItemImage from "./ItemImage";
import { usePathname, useRouter } from "next/navigation";
import LikeButton from "./LikeButton";
import { useSession } from "next-auth/react";
import GoogleAuthButton from "./GoogleAuthButton";
import Header from "./Header";

export default function ScrollableList() {
  const parentRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const skeletonRef = useRef<HTMLDivElement>(null);
  const stubRef = useRef<HTMLDivElement>(null);
  const params = useCustomQueryParams();
  const urlId = params?.get("id");
  const router = useRouter();
  const pathname = usePathname();

  const { status } = useSession();

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
        count: 27n ** 80n - 1n,
        size: 166,
        getScrollElement: () => parentRef.current,
        getContentElement: () => contentRef.current,
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
      startTransition(() => {
        setModelId(urlId);
        router.replace(pathname, { scroll: false });
      });
    }
  }, [bigScrollVirtualizer, pathname, router, updateSearchState, urlId]);

  return (
    <>
      <div className="flex flex-col min-h-dvh h-dvh overflow-hidden">
        <Header
          onSearch={(value) => {
            const search = value.trimEnd();
            if (search) {
              updateSearchState(textToBigInt(search));
            } else {
              setCurrentIndex(undefined);
            }
          }}
          currentSearch={
            typeof currentIndex !== "undefined"
              ? bigIntToText(currentIndex).trimEnd()
              : ""
          }
        />

        <div className="relative flex-1 flex flex-col overflow-hidden mt-16">
          <div
            ref={parentRef}
            className="flex justify-center overflow-y-auto min-h-full w-full clouds-background"
          >
            <div
              ref={skeletonRef}
              className="absolute skeleton-background top-0 w-full h-full max-w-[600px] outline-1 outline-general-50"
            ></div>
            <div
              style={{
                height: `${bigScrollVirtualizer.totalSize}px`,
              }}
              className="w-full max-w-[600px] transition-opacity relative skeleton-background select-none"
              ref={contentRef}
            >
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
        {/* <div>
          <Link href={"/privacy-policy"}>Privacy Policy</Link> {" | "}
          <Link href={"/terms-of-use"}>Terms Of Use</Link>
        </div> */}
      </div>
      <Modal
        isOpen={!!modalData}
        onClose={() => {
          setModelId(null);
        }}
        className="w-[568px] min-h-[210px] flex flex-col justify-between gap-5 p-5 pl-7 pt-9"
      >
        <pre className="whitespace-pre-wrap break-words max-w-full font-sans overflow-hidden pr-4">
          {modalData?.text.trimEnd()}
        </pre>
        {modalData?.image && (
          <ItemImage src={modalData.image} className="w-full" />
        )}
        {!!modalData && (
          <div className="flex gap-2 justify-end">
            <Button
              onClick={() => {
                window.navigator.clipboard
                  .writeText(genLink(modalData.id))
                  .then(() => {
                    alert("LINK COPIED");
                  });
              }}
              title="Copy Link"
              size="sm"
              variant="white"
              className="border-none p-0 text-general-80"
            >
              <LinkIcon />
            </Button>
            {status === "authenticated" ? (
              <LikeButton id={modalData.id} />
            ) : (
              <GoogleAuthButton callbackUrl={genLink(modalData.id)}>
                Login to Like
              </GoogleAuthButton>
            )}
          </div>
        )}
      </Modal>
    </>
  );
}
