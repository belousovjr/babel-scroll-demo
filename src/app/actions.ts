"use server";

import Like, { LikeData } from "./lib/db/models/Like";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { connectToDatabase } from "./lib/db";

const CreateLikeSchema = z.object({
  id: z.string().length(64),
  email: z.string().email(),
});

async function getEmail() {
  const session = await getServerSession();
  if (!session || !session.user?.email) {
    throw new Error("User must be authenticated to like a post");
  }

  return session.user.email;
}

export async function toggleLikeAction(id: string): Promise<string[]> {
  const email = await getEmail();
  const validated = CreateLikeSchema.safeParse({
    id,
    email,
  });
  if (!validated.success) throw new Error("Invalid data");

  await connectToDatabase();

  const existingLike = (await Like.findById(id).select(
    "emails"
  )) as LikeData | null;

  const update =
    existingLike && existingLike.emails.includes(email)
      ? { $pull: { emails: email } }
      : { $addToSet: { emails: email } };

  const likeData = await Like.findByIdAndUpdate(id, update, {
    upsert: true,
    new: true,
  }).select("emails");

  if (!likeData.emails.length) {
    await likeData.deleteOne();
  }

  return likeData.emails || [];
}

export async function getLikeDataItemsAction(
  ids: string[]
): Promise<LikeData[]> {
  await connectToDatabase();
  const getLikeDataItems = await Like.find({ _id: { $in: ids } });
  return getLikeDataItems.filter(Boolean).map((item) => item.toObject());
}
