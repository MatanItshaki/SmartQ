import mongoose from "mongoose";

/**
 * Establishes a connection to the MongoDB database using Mongoose.
 * 
 * This function retrieves the connection URI from the `MONGO_URI` environment variable.
 * If the connection is successful, it logs a success message.
 * If the connection fails, it logs the error and terminates the process with exit code 1.
 * 
 * @async
 * @function connectDB
 * @throws {Error} If connection to MongoDB fails.
 * @returns {Promise<void>} 
 */
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  }
};

export default connectDB;
