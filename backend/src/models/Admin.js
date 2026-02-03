import mongoose from "mongoose";
import User from "./User.js";

const AdminSchema = new mongoose.Schema({});

/**
 * Admin Model
 * 
 * Discriminator of the User model. Represents an administrator user.
 * Currently shares the same schema structure as the base User model but distinguished by `role: "admin"`.
 */
const Admin = User.discriminator("admin", AdminSchema);

export default Admin;
