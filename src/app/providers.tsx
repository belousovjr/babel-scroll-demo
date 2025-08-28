"use client";

import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import LikesContextProvider from "./lib/providers/LikesContextProvider";

export default function Providers({
  session,
  children,
}: {
  session: Session | null;
  children: React.ReactNode;
}) {
  return (
    <SessionProvider session={session}>
      <LikesContextProvider>{children}</LikesContextProvider>
    </SessionProvider>
  );
}
