import { memo, useEffect, useRef, useState } from "react";
import { BigScrollItem } from "../lib/types";
import { Avatar } from "./Avatar";
import LikeButton from "./LikeButton";
import ItemImage from "./ItemImage";
import useServiceContext from "../lib/helpers/useServiceContext";
import TutorialTip from "./TutorialTip";
import { useSession } from "next-auth/react";

interface ListItemProps extends BigScrollItem {
  isSelected: boolean;
  onClick: (id: string) => void;
}

export default memo(function ListItem({
  id,
  text,
  size,
  start,
  image,
  username,
  nickname,
  createdAt,
  isSelected,
  onClick,
}: ListItemProps) {
  const { setNotification } = useServiceContext();
  const { status } = useSession();
  const itemRef = useRef<HTMLDivElement>(null);
  const [isTopSelected, setIsTopSelected] = useState(false);

  useEffect(() => {
    if (isSelected) {
      const scrollableParent = itemRef.current?.parentElement?.parentElement;
      const scrollHandler = () => {
        if (scrollableParent) {
          setIsTopSelected(Math.round(scrollableParent.scrollTop) === start);
        }
      };
      scrollHandler();
      scrollableParent?.addEventListener("scroll", scrollHandler);
      return () => {
        scrollableParent?.removeEventListener("scroll", scrollHandler);
      };
    }
  }, [start, isSelected]);

  return (
    <div
      style={{
        height: `${size}px`,
        transform: `translateY(${start}px)`,
      }}
      className="absolute top-0 left-0 flex flex-col gap-2.5 px-5 py-2.5 bg-white w-full box-border border-t-1 border-general-50 cursor-pointer"
      onClick={() => {
        onClick(id);
      }}
      ref={itemRef}
    >
      <div className="grid grid-cols-[56px_1fr] gap-4">
        <Avatar value={username} />
        <TutorialTip
          status="SHOW_RESULT"
          hidden={!isSelected}
          disabled={!isTopSelected}
          className="z-30"
        >
          <div className="flex-1 overflow-hidden">
            <p className="shrink-1 grow-0 overflow-hidden overflow-ellipsis text-nowrap mb-0.5">
              <span className="font-medium">{nickname}</span>{" "}
              <span className="text-general-80">
                @{username} · {createdAt} B.C.
              </span>
            </p>
            <div className="flex gap-4 items-center">
              <pre
                className={`flex-1 whitespace-pre-wrap h-18.5 break-words max-w-full font-sans transition-colors underline underline-offset-5 decoration-4 overflow-hidden ${
                  isSelected
                    ? "decoration-primary-100"
                    : "decoration-transparent"
                }`}
              >
                {text.trimEnd()}
              </pre>
              {image && (
                <ItemImage src={image} className="w-10 h-10 lg:h-20 lg:w-20" />
              )}
            </div>
          </div>
        </TutorialTip>
      </div>
      <div className="flex gap-2 justify-end min-h-9">
        <LikeButton
          id={id}
          onClick={() => {
            if (status !== "authenticated") {
              setNotification?.({ text: "Login to Like", variant: "alert" });
              onClick(id);
            }
          }}
        />
      </div>
    </div>
  );
});
