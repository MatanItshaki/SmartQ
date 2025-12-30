import mongoose from "mongoose";

const { Schema, model } = mongoose;

const appointmentSchema = new Schema(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      index: true,
    },

    client: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    employee: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    service: {
      type: Schema.Types.ObjectId,
      ref: "Service",
      required: true,
      index: true,
    },

    startTime: { type: Date, required: true, index: true },
    endTime: { type: Date, required: true },

    status: {
      type: String,
      enum: ["scheduled", "cancelled", "completed"],
      default: "scheduled",
      index: true,
    },

    notes: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

// מניעת כפילות תורים לאותו עובד באותו טווח (עוזר לביצועים)
appointmentSchema.index({ employee: 1, startTime: 1 });

export default model("Appointment", appointmentSchema);
