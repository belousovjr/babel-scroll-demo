import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { useMemo, useState } from "react";

export default function AuthForm() {
  const [isOperationLoading, setIsOperationLoading] = useState(false);
  const { data: session, status } = useSession();

  const isLoading = useMemo(
    () => status === "loading" || isOperationLoading,
    [isOperationLoading, status]
  );

  return (
    <div className="flex gap-2 items-center">
      {isLoading ? (
        "LOADING"
      ) : session ? (
        <>
          {session.user?.image && (
            <Image
              className="h-6 w-6"
              src={session.user.image}
              alt="avatar"
              width={96}
              height={96}
            />
          )}
          <span>Hey, {session.user?.name}</span>{" "}
          <button
            onClick={() => {
              setIsOperationLoading(true);
              signOut();
            }}
          >
            Logout
          </button>
        </>
      ) : (
        <button
          onClick={() => {
            setIsOperationLoading(true);
            signIn("google");
          }}
        >
          Login with Google
        </button>
      )}
    </div>
  );
}
