import mongoose from "mongoose";

const { Schema, model } = mongoose;

/**
 * EmployeeService Schema
 * 
 * Link table associating an Employee with a Service they can perform.
 * 
 * @property {ObjectId} employee - Reference to the Employee (User).
 * @property {ObjectId} service - Reference to the Service.
 */
const employeeServiceSchema = new Schema(
  {
    employee: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    service: {
      type: Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
  },
);

// prevent duplicate pairs (same employee assigned to same service twice)
employeeServiceSchema.index({ employee: 1, service: 1 }, { unique: true });

export default model("EmployeeService", employeeServiceSchema);
