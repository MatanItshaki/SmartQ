import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("Employee", employeeSchema);
