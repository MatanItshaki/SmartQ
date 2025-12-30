import mongoose from "mongoose";

const baseOptions = {
  discriminatorKey: "role",
  timestamps: true,
};

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, default: "" },

    passwordHash: { type: String, required: true, select: false },

    isActive: { type: Boolean, default: true },
  },
  baseOptions
);

UserSchema.index({ email: 1 }, { unique: true });

const hidePassword = (doc, ret) => {
  delete ret.passwordHash;
  return ret;
};

UserSchema.set("toJSON", { transform: hidePassword });
UserSchema.set("toObject", { transform: hidePassword });

export default mongoose.model("User", UserSchema);
