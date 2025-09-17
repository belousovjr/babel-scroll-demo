import Image from "next/image";
import { useEffect, useState } from "react";

export default function ItemImage({
  src,
  className,
}: {
  src: string;
  className?: string;
}) {
  const [retry, setRetry] = useState(0);
  const [isFetched, setIsFetched] = useState(false);

  useEffect(() => {
    setIsFetched(false);
  }, [src]);

  return (
    <div
      className={`bg-general-40 rounded-xl overflow-hidden ${
        !isFetched ? "animate-pulse" : ""
      } ${className}`}
    >
      <Image
        src={src}
        width={512}
        height={256}
        alt=""
        key={retry}
        className={`object-cover w-full h-full transition-opacity ${
          !isFetched ? "opacity-0" : "opacity-100"
        }`}
        onLoad={() => {
          setIsFetched(true);
        }}
        onError={() => {
          setRetry((v) => v + 1);
        }}
      />
    </div>
  );
}
