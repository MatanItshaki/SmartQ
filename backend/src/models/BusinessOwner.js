import User from "./User.js";
import mongoose from "mongoose";

const BusinessUserSchema = new mongoose.Schema({
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Business",
    required: true,
  },
  // אופציונלי: הרשאות
  // permissions: [{ type: String }]
});

BusinessUserSchema.index({ businessId: 1 });

export default User.discriminator("business", BusinessUserSchema);
