import { ScrollItem } from "../lib/types";
import LikeButton from "./LikeButton";

interface ListItemProps {
  data: ScrollItem;
  isSelected: boolean;
  onClick: () => void;
}

export default function ListItem({ data, isSelected, onClick }: ListItemProps) {
  return (
    <div
      style={{
        height: `${data.size}px`,
        transform: `translateY(${data.start}px)`,
      }}
      className={`absolute top-0 left-0 w-full overflow-hidden border-white border-1 border-r-0 p-2 bg-gray-800 box-border transition-colors flex flex-col justify-between items-start ${
        isSelected ? "bg-yellow-600 text-black font-bold" : ""
      }`}
    >
      <pre className="text-xl whitespace-pre-wrap break-words">{data.text}</pre>
      <div className="flex gap-2 absolute right-2 bottom-2 text-white font-normal pr-4">
        <button
          onClick={onClick}
          className="flex justify-center cursor-pointer bg-gray-700"
        >
          <span className="px-2">open</span>
        </button>
        <LikeButton id={data.id} />
      </div>
    </div>
  );
}
