import mongoose from "mongoose";

const { Schema, model } = mongoose;

const employeeServiceSchema = new Schema(
  {
    employee: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
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
