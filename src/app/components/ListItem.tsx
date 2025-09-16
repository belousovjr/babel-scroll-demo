import { BigScrollItem } from "../lib/types";
import { Avatar } from "./Avatar";
import LikeButton from "./LikeButton";
import ItemImage from "./ItemImage";
import { useMemo } from "react";
import { LinkIcon } from "lucide-react";

interface ListItemProps extends BigScrollItem {
  isSelected: boolean;
  onClick: () => void;
}

export default function ListItem({
  id,
  text,
  size,
  start,
  image,
  isSelected,
  onClick,
}: ListItemProps) {
  const link = useMemo(() => {
    return `${window.location.origin}?id=${id}`;
  }, [id]);

  return (
    <div
      style={{
        height: `${size}px`,
        transform: `translateY(${start}px)`,
      }}
      className="absolute top-0 left-0 flex flex-col gap-2.5 px-5 py-2.5 bg-white w-full box-border border-t-1 border-general-50"
    >
      <div className="flex-1 flex gap-4 overflow-hidden">
        <Avatar value={text} />
        <div
          onClick={onClick}
          className="flex flex-1 gap-2.5 cursor-pointer overflow-hidden"
        >
          <pre
            className={`flex-1 whitespace-pre-wrap h-18 break-words max-w-full font-sans transition-colors underline underline-offset-5 decoration-4 ${
              isSelected ? "decoration-primary-100" : "decoration-transparent"
            }`}
          >
            {text.trimEnd()}
          </pre>
          {image && <ItemImage src={image} className="h-20 w-20" />}
        </div>
      </div>
      <div className="flex gap-2 justify-end min-h-9">
        <button
          onClick={() => {
            window.navigator.clipboard.writeText(link).then(() => {
              alert("LINK COPIED");
            });
          }}
          title="Copy Link"
          className="cursor-pointer"
        >
          <LinkIcon />
        </button>
        <LikeButton id={id} />
      </div>
    </div>
  );
}
