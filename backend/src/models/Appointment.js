import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    client: { type: mongoose.Schema.Types.ObjectId, ref: "Client", required: true },
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    service: { type: mongoose.Schema.Types.ObjectId, ref: "Service", required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    status: {
      type: String,
      enum: ["booked", "cancelled", "completed"],
      default: "booked"
    }
  },
  { timestamps: true }
);

export default mongoose.model("Appointment", appointmentSchema);
