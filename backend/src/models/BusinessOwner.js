import User from "./User.js";
import mongoose from "mongoose";

const businessOwnerSchema = new mongoose.Schema({
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Business",
    required: true,
  },
  // אופציונלי: הרשאות
  // permissions: [{ type: String }]
});

businessOwnerSchema.index({ businessId: 1 });

export default User.discriminator("business", businessOwnerSchema);
