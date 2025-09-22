"use client";

import { bigIntToText, idToBigInt, prepText, textToBigInt } from "../lib/codec";
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
import useServiceContext from "../lib/helpers/useServiceContext";
import Snackbar from "./Snackbar";
import useTutorial from "../lib/helpers/useTutorial";
import TutorialTip from "./TutorialTip";

export default function ScrollableList() {
  const parentRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const skeletonRef = useRef<HTMLDivElement>(null);
  const stubRef = useRef<HTMLDivElement>(null);
  const params = useCustomQueryParams();
  const urlId = params?.get("id");
  const router = useRouter();
  const pathname = usePathname();

  const { setNotification } = useServiceContext();
  const { checkStatus } = useTutorial();

  const { status } = useSession();

  const [currentIndex, setCurrentIndex] = useState<bigint>();
  const [isModalOpened, setIsModalOpened] = useState(false);
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
    (index: bigint | null) => {
      startTransition(() => {
        setCurrentIndex(index !== null ? index : undefined);
      });
      if (index !== null) {
        checkStatus("SHOW_RESULT");
        bigScrollVirtualizer.search(index);
      }
    },
    [bigScrollVirtualizer, checkStatus]
  );

  useEffect(() => {
    if (urlId) {
      if (!isDefaultScrolled.current) {
        updateSearchState(idToBigInt(urlId));
        isDefaultScrolled.current = true;
        setModelId(urlId);
      } else if (!bigScrollVirtualizer.isSearch) {
        router.replace(pathname, { scroll: false });
      }
    }
  }, [
    bigScrollVirtualizer.isSearch,
    pathname,
    router,
    updateSearchState,
    urlId,
  ]);

  useEffect(() => {
    const timeout = setTimeout(
      () => {
        setIsModalOpened(!!modalData);
      },
      modalData ? 200 : 0
    );

    if (modalData) {
      if (status !== "authenticated") {
        checkStatus("LOGIN_TO_LIKE");
      } else {
        checkStatus("CHECK_ACTIONS");
      }
    }

    return () => {
      clearTimeout(timeout);
    };
  }, [checkStatus, modalData, status]);

  const onClickItem = useCallback((id: string) => {
    setModelId(id);
  }, []);

  return (
    <>
      <div className="flex flex-col min-h-dvh h-dvh overflow-hidden">
        <Header
          onSearch={(value) => {
            const search = prepText(value);
            updateSearchState(search.trimEnd() ? textToBigInt(search) : null);
          }}
          currentSearch={
            typeof currentIndex !== "undefined"
              ? bigIntToText(currentIndex).trimEnd()
              : ""
          }
          isSearch={bigScrollVirtualizer.isSearch}
        />

        <div className="relative flex-1 flex flex-col overflow-hidden mt-16">
          <div
            ref={parentRef}
            className="flex justify-center overflow-y-auto min-h-full w-full clouds-background"
          >
            <div
              ref={skeletonRef}
              className="absolute skeleton-background blur-[1px] top-0 w-full h-full max-w-[600px] outline-1 outline-general-50"
            ></div>
            <div
              style={{
                height: `${bigScrollVirtualizer.totalSize}px`,
              }}
              className="w-full max-w-[600px] relative skeleton-background select-none"
              ref={contentRef}
            >
              {bigScrollVirtualizer.items.map((virtualItem) => (
                <ListItem
                  {...virtualItem}
                  key={virtualItem.index}
                  isSelected={virtualItem.index === currentIndex}
                  onClick={onClickItem}
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
        <div className="ml-auto flex">
          {!!modalData && (
            <TutorialTip
              status="CHECK_ACTIONS"
              defaultPosition="top"
              disabled={!isModalOpened}
              hidden={status !== "authenticated"}
            >
              <Button
                onClick={() => {
                  window.navigator.clipboard
                    .writeText(genLink(modalData.id))
                    .then(() => {
                      setNotification?.({
                        text: "Link copied",
                        variant: "success",
                      });
                    });
                  checkStatus("FINAL");
                }}
                title="Copy Link"
                size="sm"
                variant="white"
                className="border-none p-0 text-general-80 mr-2"
                icon={<LinkIcon />}
              />
              {status === "authenticated" ? (
                <LikeButton
                  id={modalData.id}
                  onClick={() => {
                    checkStatus("FINAL");
                  }}
                />
              ) : (
                <TutorialTip
                  status="LOGIN_TO_LIKE"
                  defaultPosition="top"
                  disabled={!isModalOpened}
                >
                  <GoogleAuthButton callbackUrl={genLink(modalData.id)}>
                    Log in to Like
                  </GoogleAuthButton>
                </TutorialTip>
              )}
            </TutorialTip>
          )}
        </div>
      </Modal>
      <Snackbar />
    </>
  );
}
