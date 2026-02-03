import mongoose from "mongoose";

const { Schema, model } = mongoose;

/**
 * Appointment Schema
 * 
 * Represents a scheduled appointment between a client and a business/employee.
 * 
 * @property {ObjectId} businessId - Reference to the Business.
 * @property {ObjectId} client - Reference to the User (client).
 * @property {ObjectId} employee - Reference to the User (employee).
 * @property {ObjectId} service - Reference to the Service being booked.
 * @property {Date} startTime - Start time of the appointment.
 * @property {Date} endTime - End time of the appointment.
 * @property {string} status - Status of the appointment (scheduled, cancelled, completed).
 * @property {string} notes - Optional notes for the appointment.
 */
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
