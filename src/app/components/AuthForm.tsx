import { signIn, signOut, useSession } from "next-auth/react";
import { useState } from "react";

export default function AuthForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { data: session } = useSession();

  return (
    <div>
      {isLoading ? (
        "LOADING"
      ) : session ? (
        <>
          <p>Hey, {session.user?.name}</p>
          <button
            onClick={() => {
              setIsLoading(true);
              signOut();
            }}
          >
            Logout
          </button>
        </>
      ) : (
        <button
          onClick={() => {
            setIsLoading(true);
            signIn("google");
          }}
        >
          Login with Google
        </button>
      )}
    </div>
  );
}
