import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
  {
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true
    },
    name: { type: String, required: true, trim: true },
    email: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },

    // many-to-many via array: employee can perform many services
    services: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Service"
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model("Employee", employeeSchema);
