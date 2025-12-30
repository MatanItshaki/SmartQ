import User from "./User.js";
import mongoose from "mongoose";

const EmployeeSchema = new mongoose.Schema({
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Business",
    required: true,
  },
});

EmployeeSchema.index({ businessId: 1 });

export default User.discriminator("employee", EmployeeSchema);
