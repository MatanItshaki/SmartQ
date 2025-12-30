// controllers/clientController.js
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Client from "../models/Client.js";

// GET /api/clients/me
export const getMyProfile = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const me = await User.findById(userId).select("-passwordHash").lean();
    if (!me) return res.status(404).json({ message: "User not found" });

    return res.json({ user: me });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/clients/me
export const updateMyProfile = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    // routes validation כבר מסנן שדות לא חוקיים
    const updates = {};
    if (req.body.name !== undefined) updates.name = req.body.name;
    if (req.body.phone !== undefined) updates.phone = req.body.phone;

    const updated = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    })
      .select("-passwordHash")
      .lean();

    if (!updated) return res.status(404).json({ message: "User not found" });

    return res.json({ user: updated });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/clients/me/password
export const changeMyPassword = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { currentPassword, newPassword } = req.body;

    // חייבים להביא passwordHash להשוואה
    const user = await User.findById(userId).select("+passwordHash");
    if (!user) return res.status(404).json({ message: "User not found" });

    const ok = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!ok) return res.status(400).json({ message: "Current password is incorrect" });

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.json({ message: "Password updated" });
  } catch (err) {
    next(err);
  }
};

// GET /api/clients  (admin)
export const getAllClients = async (req, res, next) => {
  try {
    const clients = await User.find({ role: "client" })
      .select("-passwordHash")
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ clients });
  } catch (err) {
    next(err);
  }
};

// GET /api/clients/:id  (admin)
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

// DELETE /api/clients/:id  (admin)
export const deleteClientById = async (req, res, next) => {
  try {
    const deleted = await User.findOneAndDelete({ _id: req.params.id, role: "client" });
    if (!deleted) return res.status(404).json({ message: "Client not found" });

    return res.json({ message: "Client deleted" });
  } catch (err) {
    next(err);
  }
};
