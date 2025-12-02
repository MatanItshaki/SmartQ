import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true
    },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    durationMinutes: { type: Number, required: true, min: 5 },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, trim: true }
  },
  { timestamps: true }
);

export default mongoose.model("Service", serviceSchema);
