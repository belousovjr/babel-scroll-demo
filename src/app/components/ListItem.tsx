import { BigScrollItem } from "../lib/types";
import LikeButton from "./LikeButton";

interface ListItemProps extends BigScrollItem {
  isSelected: boolean;
  onClick: () => void;
}

export default function ListItem({
  id,
  text,
  size,
  start,
  isSelected,
  onClick,
}: ListItemProps) {
  return (
    <div
      style={{
        height: `${size}px`,
        transform: `translateY(${start}px)`,
      }}
      className={`absolute top-0 left-0 w-full border-white border-1 border-r-0 bg-gray-800 box-border transition-colors ${
        isSelected ? "bg-yellow-600 text-black font-bold" : ""
      }`}
    >
      <div
        onClick={onClick}
        className="flex flex-col justify-between items-start h-full p-2 cursor-pointer"
      >
        <pre className="text-xl whitespace-pre-wrap break-words">{text}</pre>
        <div className="flex gap-2 absolute right-2 bottom-2 text-white font-normal pr-4">
          <LikeButton id={id} />
        </div>
      </div>
    </div>
  );
}
