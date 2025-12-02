import mongoose from "mongoose";

const clientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    phone: { type: String, trim: true },
    businesses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Business"
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model("Client", clientSchema);
