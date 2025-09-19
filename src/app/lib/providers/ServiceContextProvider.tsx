"use client";
import { ReactNode, useState, createContext, useCallback } from "react";
import { SnackbarData } from "../types";

export const ServiceContext = createContext<{
  notification: SnackbarData | null;
  setNotification?: (value: Omit<SnackbarData, "timestamp"> | null) => void;
}>({
  notification: null,
});

export default function ServiceContextProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [snackbarData, setSnackbarData] = useState<SnackbarData | null>(null);

  const setNotification = useCallback(
    (data: Omit<SnackbarData, "timestamp"> | null) => {
      setSnackbarData(data && { ...data, timestamp: Date.now() });
    },
    []
  );

  return (
    <ServiceContext
      value={{
        notification: snackbarData,
        setNotification: setNotification,
      }}
    >
      {children}
    </ServiceContext>
  );
}
