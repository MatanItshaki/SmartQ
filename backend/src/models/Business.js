import mongoose from "mongoose";

const { Schema, model } = mongoose;

const businessSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    niche: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
  },
);

export default model("Business", businessSchema);
