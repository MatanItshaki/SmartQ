import mongoose from "mongoose";
import User from "./User.js";

const AdminSchema = new mongoose.Schema({});

const Admin = User.discriminator("admin", AdminSchema);

export default Admin;
