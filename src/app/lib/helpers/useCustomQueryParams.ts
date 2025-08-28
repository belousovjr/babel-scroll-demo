"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function useCustomQueryParams() {
  const params = useSearchParams();
  const [readyParams, setReadyParams] = useState<URLSearchParams | null>(null);

  useEffect(() => {
    setReadyParams(params);
  }, [params]);

  return readyParams;
}
