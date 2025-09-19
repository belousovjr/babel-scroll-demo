"use client";

import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import LikesContextProvider from "./lib/providers/LikesContextProvider";
import ServiceContextProvider from "./lib/providers/ServiceContextProvider";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { persistor, store } from "./lib/store/store";

export default function Providers({
  session,
  children,
}: {
  session: Session | null;
  children: React.ReactNode;
}) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <SessionProvider session={session}>
          <ServiceContextProvider>
            <LikesContextProvider>{children}</LikesContextProvider>
          </ServiceContextProvider>
        </SessionProvider>
      </PersistGate>
    </Provider>
  );
}
