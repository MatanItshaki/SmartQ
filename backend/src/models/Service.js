import mongoose from "mongoose";

const { Schema, model } = mongoose;

/**
 * Service Schema
 * 
 * Represents a service offered by a business.
 * 
 * @property {ObjectId} business - Reference to the Business offering the service.
 * @property {string} name - Name of the service.
 * @property {string} description - Brief description of the service.
 * @property {number} durationMinutes - Duration of the service in minutes.
 * @property {number} price - Cost of the service.
 * @property {string} category - Category grouping for the service.
 */
const serviceSchema = new Schema(
  {
    business: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    durationMinutes: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      trim: true,
    },
  },
);

export default model("Service", serviceSchema);
