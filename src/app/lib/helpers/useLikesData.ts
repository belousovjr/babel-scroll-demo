import { useContext, useEffect, useMemo } from "react";
import { LikesContext } from "../../providers/LikesContextProvider";
import { LikeData } from "../db/models/Like";

export default function useLikesData(id: string): {
  data: LikeData | null;
  isPending: boolean;
  isLoading: boolean;
  refetch: () => Promise<void>;
} {
  const { list, checkItems, fetchItems } = useContext(LikesContext);

  const cachedLikeData = useMemo(() => {
    const likesData = list.get(id);

    return {
      data: null as LikeData | null,
      isPending: true,
      isLoading: true,
      refetch: async () => {
        await fetchItems?.([id]);
      },
      ...(list.get(id) || {}),
    };
  }, [list, id, fetchItems]);

  useEffect(() => {
    if (!list.get(id)) {
      checkItems?.([id]);
    }
  }, [checkItems, id, list]);

  return cachedLikeData;
}
