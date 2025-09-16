import { useCallback, useMemo, useState } from "react";
import useLikesData from "../lib/helpers/useLikesData";
import { toggleLikeAction } from "../actions";
import { useSession } from "next-auth/react";
import { Button } from "@belousovjr/uikit";
import { HeartIcon } from "lucide-react";

export default function LikeButton({ id }: { id: string }) {
  const [isSendLoading, setIsSendLoading] = useState(false);

  const { status, data: session } = useSession();

  const likesData = useLikesData(id);

  const isLoading = useMemo(
    () => isSendLoading || (!likesData.isLoading && likesData.isPending),
    [isSendLoading, likesData.isLoading, likesData.isPending]
  );

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
    <Button
      size="sm"
      variant="white"
      icon={<HeartIcon className="fill-inherit" />}
      className={`px-2 border-none min-w-13 ${
        isLikedData || isLoading
          ? "text-red-100 fill-current"
          : "text-general-80 fill-transparent"
      } ${isLoading ? "cursor-default" : ""}`}
      title={
        likesData.data?.emails.length
          ? `Liked by: ${likesData.data.emails
              .map((email) => email)
              .join(", ")}`
          : undefined
      }
      onClick={() => {
        if (!isLoading) {
          if (status === "authenticated") {
            likeItem();
          } else {
            alert("Login to like");
          }
        }
      }}
      type="button"
    >
      {likesData.data?.emails.length}
    </Button>
  );
}
