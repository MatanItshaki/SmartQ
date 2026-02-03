import mongoose from "mongoose";

const { Schema, model } = mongoose;

/**
 * BusinessClient Schema
 * 
 * Represents the relationship between a Business and a Client (User).
 * Created when a client interacts with or is added to a business.
 * 
 * @property {ObjectId} business - Reference to the Business.
 * @property {ObjectId} client - Reference to the User (client).
 */
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
