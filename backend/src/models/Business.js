import mongoose from "mongoose";

const { Schema, model } = mongoose;

/**
 * Business Schema
 * 
 * Represents a business entity in the system.
 * 
 * @property {string} name - Name of the business.
 * @property {string} niche - Niche or category of the business.
 * @property {string} address - Physical address of the business.
 * @property {string} phone - Contact phone number.
 */
const businessSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    niche: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
      unique: true,

    },
    phone: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

businessSchema.index({ name: 1 });

export default model("Business", businessSchema);
