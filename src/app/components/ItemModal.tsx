import { useMemo } from "react";
import { idToText } from "../lib/codec";
import LikeButton from "./LikeButton";

interface ItemModalProps {
  id: string;
  close: () => void;
}

export default function ItemModal({ id, close }: ItemModalProps) {
  const text = useMemo(() => {
    return idToText(id);
  }, [id]);

  const link = useMemo(() => {
    return `${window.location.origin}?id=${id}`;
  }, [id]);

  return (
    <div
      onClick={close}
      className="fixed left-0 top-0 flex justify-center items-center h-dvh w-full bg-black/60 bg-opacity-50"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-gray-800 border-white border-1 p-8 overflow-auto max-h-full max-w-full min-w-1/2"
      >
        <pre className="bg-gray-900 p-4 mb-4 whitespace-pre-wrap break-words">
          {text}
        </pre>
        <div className="flex gap-2 items-center justify-end">
          <button
            onClick={() => {
              window.navigator.clipboard.writeText(link).then(() => {
                alert("LINK COPIED");
              });
            }}
            className="px-1 cursor-pointer"
          >
            🔗
          </button>
          <LikeButton id={id} />
        </div>

        <button
          className="absolute right-1 top-1 cursor-pointer"
          onClick={close}
        >
          ❌
        </button>
      </div>
    </div>
  );
}
