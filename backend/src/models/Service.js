import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: Number,
    duration: Number,
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("Service", serviceSchema);
