import { useCallback, useMemo, useState } from "react";
import useLikesData from "../lib/helpers/useLikesData";
import { toggleLikeAction } from "../actions";
import { useSession } from "next-auth/react";

export default function LikeButton({ id }: { id: string }) {
  const [isSendLoading, setIsSendLoading] = useState(false);

  const { status, data: session } = useSession();

  const likesData = useLikesData(id);

  const isLikedData = useMemo(() => {
    return (
      status === "authenticated" &&
      !!session?.user?.email &&
      likesData.data?.emails.includes(session.user.email)
    );
  }, [likesData.data?.emails, session, status]);

  const likeItem = useCallback(async () => {
    try {
      setIsSendLoading(true);
      await toggleLikeAction(id);
      await likesData.refetch();
    } finally {
      setIsSendLoading(false);
    }
  }, [likesData, id]);

  return (
    <button
      title={
        likesData.data
          ? likesData.data.emails.length
            ? "Liked by: " +
              likesData.data.emails.map((email) => email).join(", ")
            : "No liked yet"
          : undefined
      }
      onClick={likeItem}
      disabled={status !== "authenticated" || isSendLoading}
      className={`flex justify-center cursor-pointer disabled:cursor-default disabled:opacity-85 transition-all ${
        isLikedData ? "bg-red-500" : "bg-gray-700"
      }`}
    >
      <span className="inline min-w-6 text-center">
        {!likesData.isLoading ? (
          likesData.isPending || isSendLoading ? (
            "⏳"
          ) : (
            likesData.data?.emails.length || 0
          )
        ) : (
          <>&nbsp;</>
        )}
      </span>
      <span className="min-w-6">
        {!likesData.isLoading ? "👍" : <>&nbsp;</>}
      </span>
    </button>
  );
}
