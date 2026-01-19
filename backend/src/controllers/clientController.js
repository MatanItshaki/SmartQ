// controllers/clientController.js
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Client from "../models/Client.js";

/**
 * @desc    Get profile of the logged-in user
 * @route   GET /api/clients/me
 * @access  Private (Self)
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
 * @desc    Update profile fields (Name, Phone)
 * @route   PATCH /api/clients/me
 * @access  Private (Self)
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
 * @desc    Securely change user password
 * @route   PATCH /api/clients/me/password
 * @access  Private (Self)
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
 * @desc    Admin only: Get all users with client role
 * @route   GET /api/clients
 * @access  Private (Admin)
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
 * @desc    Admin only: Get details of a specific client
 * @route   GET /api/clients/:id
 * @access  Private (Admin)
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
 * @desc    Admin only: Delete a client account
 * @route   DELETE /api/clients/:id
 * @access  Private (Admin)
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