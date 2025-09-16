import { update } from "jdenticon";
import { useEffect, useRef } from "react";

export function Avatar({
  value,
  className,
}: {
  value: string;
  className?: string;
  title?: string;
}) {
  const iconRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (iconRef.current) {
      update(iconRef.current, value);
      iconRef.current.classList.remove("opacity-0");
    }
  }, [value]);

  return (
    <span className="w-14 h-14 rounded-full bg-general-50">
      <svg
        data-jdenticon-value={value}
        ref={iconRef}
        height={20}
        width={20}
        className={`rounded-full shrink-0 w-full h-full border-1 bg-white border-general-50 transition-opacity opacity-0 ${
          className ?? ""
        }`}
      />
    </span>
  );
}
