// controllers/clientController.js
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Client from "../models/Client.js";

/**
 * Retrieves the profile of the currently logged-in user.
 * 
 * @param {import("express").Request} req - Express request object.
 * @param {import("express").Response} res - Express response object.
 * @param {import("express").NextFunction} next - Express next middleware function.
 * @returns {Promise<void>}
 */
export const getMyProfile = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    // Find user and exclude sensitive password field
    const me = await User.findById(userId).select("-passwordHash").lean();
    if (!me) return res.status(404).json({ message: "User not found" });

    return res.json({ user: me });
  } catch (err) {
    next(err);
  }
};

/**
 * Updates profile fields (Name, Phone) for the logged-in user.
 * 
 * @param {import("express").Request} req - Express request object.
 * @param {import("express").Response} res - Express response object.
 * @param {import("express").NextFunction} next - Express next middleware function.
 * @returns {Promise<void>}
 */
export const updateMyProfile = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    // Partial update logic: only update fields provided in the body
    const updates = {};
    if (req.body.name !== undefined) updates.name = req.body.name;
    if (req.body.phone !== undefined) updates.phone = req.body.phone;

    const updated = await User.findByIdAndUpdate(userId, updates, {
      new: true, // Return the updated document
      runValidators: true, // Ensure schema validation is triggered
    })
      .select("-passwordHash")
      .lean();

    if (!updated) return res.status(404).json({ message: "User not found" });

    return res.json({ user: updated });
  } catch (err) {
    next(err);
  }
};

/**
 * Securely changes the user's password.
 * 
 * Verifies the current password before applying the new one.
 * 
 * @param {import("express").Request} req - Express request object.
 * @param {import("express").Response} res - Express response object.
 * @param {import("express").NextFunction} next - Express next middleware function.
 * @returns {Promise<void>}
 */
export const changeMyPassword = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { currentPassword, newPassword } = req.body;

    // Must explicitly select passwordHash as it is excluded by default in schema
    const user = await User.findById(userId).select("+passwordHash");
    if (!user) return res.status(404).json({ message: "User not found" });

    // Verify current password before allowing change
    const ok = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!ok) return res.status(400).json({ message: "Current password is incorrect" });

    // Hash and save the new password
    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.json({ message: "Password updated" });
  } catch (err) {
    next(err);
  }
};

/**
 * Retrieves all users with the 'client' role (Admin only).
 * 
 * @param {import("express").Request} req - Express request object.
 * @param {import("express").Response} res - Express response object.
 * @param {import("express").NextFunction} next - Express next middleware function.
 * @returns {Promise<void>}
 */
export const getAllClients = async (req, res, next) => {
  try {
    const clients = await User.find({ role: "client" })
      .select("-passwordHash")
      .sort({ createdAt: -1 }) // Newest first
      .lean();

    return res.json({ clients });
  } catch (err) {
    next(err);
  }
};

/**
 * Retrieves details of a specific client by ID (Admin only).
 * 
 * @param {import("express").Request} req - Express request object.
 * @param {import("express").Response} res - Express response object.
 * @param {import("express").NextFunction} next - Express next middleware function.
 * @returns {Promise<void>}
 */
export const getClientById = async (req, res, next) => {
  try {
    const client = await User.findOne({ _id: req.params.id, role: "client" })
      .select("-passwordHash")
      .lean();

    if (!client) return res.status(404).json({ message: "Client not found" });

    return res.json({ client });
  } catch (err) {
    next(err);
  }
};

/**
 * Deletes a client account (Admin only).
 * 
 * @param {import("express").Request} req - Express request object.
 * @param {import("express").Response} res - Express response object.
 * @param {import("express").NextFunction} next - Express next middleware function.
 * @returns {Promise<void>}
 */
export const deleteClientById = async (req, res, next) => {
  try {
    // Ensure we are only deleting users who are actually clients
    const deleted = await User.findOneAndDelete({ _id: req.params.id, role: "client" });
    if (!deleted) return res.status(404).json({ message: "Client not found" });

    return res.json({ message: "Client deleted" });
  } catch (err) {
    next(err);
  }
};