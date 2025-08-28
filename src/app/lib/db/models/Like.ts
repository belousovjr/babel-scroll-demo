import { InferSchemaType, Schema, model, models } from "mongoose";

const LikeSchema = new Schema(
  {
    _id: { type: String, required: true, maxlength: 64, minlength: 64 },
    emails: { type: [String], default: [] },
  },
  { _id: false }
);

const Like = models.Like || model("Like", LikeSchema);

export default Like;

export type LikeData = InferSchemaType<typeof LikeSchema>;
