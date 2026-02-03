import User from "./User.js";
import mongoose from "mongoose";

const ClientSchema = new mongoose.Schema({
});

/**
 * Client Model
 * 
 * Discriminator of the User model. Represents a standard client user.
 * Currently shares the same schema structure as the base User model but distinguished by `role: "client"`.
 */
export default User.discriminator("client", ClientSchema);
