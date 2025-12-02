import mongoose from "mongoose";

const businessSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    niche: { type: String, trim: true }, // barber, clinic, gym...
    address: { type: String, trim: true },
    phone: { type: String, trim: true }
  },
  { timestamps: true }
);

export default mongoose.model("Business", businessSchema);
