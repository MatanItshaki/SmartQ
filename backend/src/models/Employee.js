import User from "./User.js";
import mongoose from "mongoose";

/**
 * Employee Model
 * 
 * Discriminator of the User model. Represents an employee working for a business.
 * 
 * @property {ObjectId} businessId - The business the employee belongs to.
 */
const EmployeeSchema = new mongoose.Schema({
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Business",
    required: true,
  },
});

EmployeeSchema.index({ businessId: 1 });

export default User.discriminator("employee", EmployeeSchema);
