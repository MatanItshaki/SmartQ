import mongoose from "mongoose";

const baseOptions = {
  discriminatorKey: "role",
  timestamps: true,
};

/**
 * User Schema
 * 
 * Base schema for all users in the system.
 * Uses Mongoose discriminators for specific roles (admin, business, client, employee).
 * 
 * @property {string} name - Full name of the user.
 * @property {string} email - Unique email address (indexed).
 * @property {string} phone - Contact phone number.
 * @property {string} passwordHash - Hashed password (selected by default, valid only for authentication).
 * @property {boolean} isActive - Whether the user account is active.
 * @property {string} role - Discriminator key (admin, business, client, employee).
 */
const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, default: "" },

    passwordHash: { type: String, required: true, select: true },

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
