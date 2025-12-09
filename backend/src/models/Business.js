import mongoose from "mongoose";

const businessSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    address: String,
    phone: String
  },
  { timestamps: true }
);

export default mongoose.model("Business", businessSchema);
