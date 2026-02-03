import User from "./User.js";
import mongoose from "mongoose";

/**
 * BusinessOwner Model
 * 
 * Discriminator of the User model. Represents a business owner.
 * Contains a reference to the Business they own.
 * 
 * @property {ObjectId} businessId - Reference to the Business owned by this user.
 */
const businessOwnerSchema = new mongoose.Schema({
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Business",
    required: true,
  },

});

businessOwnerSchema.index({ businessId: 1 });

export default User.discriminator("business", businessOwnerSchema);
