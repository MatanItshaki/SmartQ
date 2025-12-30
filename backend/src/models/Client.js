import User from "./User.js";
import mongoose from "mongoose";

const ClientSchema = new mongoose.Schema({
});

export default User.discriminator("client", ClientSchema);
