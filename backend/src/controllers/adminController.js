// controllers/adminController.js
import User from "../models/User.js";
import Business from "../models/Business.js";
import Service from "../models/Service.js";
import Appointment from "../models/Appointment.js";

/**
 * Get system-wide dashboard statistics.
 * 
 * Returns counts for businesses, users (by role), services, and appointments (by status).
 * 
 * @access Admin only
 */
export const getDashboardStats = async (req, res, next) => {
    try {
        const [
            totalBusinesses,
            totalClients,
            totalEmployees,
            totalBusinessOwners,
            totalServices,
            totalAppointments,
            scheduledAppointments,
            completedAppointments,
            cancelledAppointments,
        ] = await Promise.all([
            Business.countDocuments(),
            User.countDocuments({ role: "client" }),
            User.countDocuments({ role: "employee" }),
            User.countDocuments({ role: "business" }),
            Service.countDocuments(),
            Appointment.countDocuments(),
            Appointment.countDocuments({ status: "scheduled" }),
            Appointment.countDocuments({ status: "completed" }),
            Appointment.countDocuments({ status: "cancelled" }),
        ]);

        // Get recent appointments (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentAppointments = await Appointment.countDocuments({
            createdAt: { $gte: sevenDaysAgo },
        });

        // Get recent users (last 7 days)
        const recentUsers = await User.countDocuments({
            createdAt: { $gte: sevenDaysAgo },
        });

        return res.json({
            success: true,
            data: {
                businesses: totalBusinesses,
                clients: totalClients,
                employees: totalEmployees,
                businessOwners: totalBusinessOwners,
                services: totalServices,
                appointments: {
                    total: totalAppointments,
                    scheduled: scheduledAppointments,
                    completed: completedAppointments,
                    cancelled: cancelledAppointments,
                },
                recent: {
                    appointments: recentAppointments,
                    users: recentUsers,
                },
            },
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Get all users in the system (all roles).
 * 
 * Supports optional filtering by role via query param.
 * 
 * @access Admin only
 */
export const getAllUsers = async (req, res, next) => {
    try {
        const query = {};
        if (req.query.role) {
            query.role = req.query.role;
        }

        const users = await User.find(query)
            .select("-passwordHash")
            .sort({ createdAt: -1 })
            .lean();

        return res.json({ success: true, count: users.length, data: users });
    } catch (err) {
        next(err);
    }
};

/**
 * Get a single user by ID.
 * 
 * @access Admin only
 */
export const getUserById = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id)
            .select("-passwordHash")
            .lean();

        if (!user) return res.status(404).json({ message: "User not found" });

        return res.json({ success: true, data: user });
    } catch (err) {
        next(err);
    }
};

/**
 * Toggle user active status.
 * 
 * @access Admin only
 */
export const toggleUserStatus = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        user.isActive = !user.isActive;
        await user.save();

        return res.json({
            success: true,
            message: `User ${user.isActive ? "activated" : "deactivated"}`,
            data: { _id: user._id, isActive: user.isActive },
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Delete any user by ID.
 * 
 * @access Admin only
 */
export const deleteUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        // Prevent admin from deleting themselves
        if (String(user._id) === String(req.user.id)) {
            return res.status(400).json({ message: "Cannot delete your own account" });
        }

        await User.findByIdAndDelete(req.params.id);
        return res.json({ success: true, message: "User deleted" });
    } catch (err) {
        next(err);
    }
};

/**
 * Get all appointments across all businesses.
 * 
 * Supports filtering by status, date range, and businessId.
 * 
 * @access Admin only
 */
export const getAllAppointments = async (req, res, next) => {
    try {
        const { status, from, to, businessId } = req.query;
        const q = {};

        if (status) q.status = status;
        if (businessId) q.businessId = businessId;

        if (from || to) {
            q.startTime = {};
            if (from) q.startTime.$gte = new Date(from);
            if (to) q.startTime.$lte = new Date(to);
        }

        const appointments = await Appointment.find(q)
            .sort({ startTime: -1 })
            .populate("client", "name email phone role")
            .populate("employee", "name email phone role businessId")
            .populate("service", "name duration price durationMinutes")
            .populate("businessId", "name niche")
            .lean();

        return res.json({
            success: true,
            count: appointments.length,
            data: appointments,
        });
    } catch (err) {
        next(err);
    }
};
