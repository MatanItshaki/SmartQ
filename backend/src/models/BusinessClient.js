import mongoose from "mongoose";

const { Schema, model } = mongoose;

const businessClientSchema = new Schema(
  {
    business: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      index: true,
    },
    client: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

// prevent duplicate pairs (same client connected to same business twice)
businessClientSchema.index({ business: 1, client: 1 }, { unique: true });

export default model("BusinessClient", businessClientSchema);
