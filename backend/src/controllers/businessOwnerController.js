import Business from "../models/Business.js";
import Employee from "../models/Employee.js";
import Service from "../models/Service.js";
import Appointment from "../models/Appointment.js";
import User from "../models/User.js";

/**
 * Get dashboard stats for the logged-in business owner's business.
 */
export const getMyBusinessStats = async (req, res, next) => {
    try {
        const businessId = req.user.businessId;
        if (!businessId) return res.status(400).json({ message: "No business associated with this account" });

        const [business, employees, services, appointments] = await Promise.all([
            Business.findById(businessId).lean(),
            Employee.find({ businessId }).lean(),
            Service.find({ business: businessId }).lean(),
            Appointment.find({ businessId }).lean(),
        ]);

        if (!business) return res.status(404).json({ message: "Business not found" });

        // Appointment breakdown
        const scheduled = appointments.filter(a => a.status === "scheduled").length;
        const completed = appointments.filter(a => a.status === "completed").length;
        const cancelled = appointments.filter(a => a.status === "cancelled").length;

        // Revenue calculation (completed appointments)
        const serviceMap = {};
        services.forEach(s => { serviceMap[String(s._id)] = s; });

        let totalRevenue = 0;
        appointments
            .filter(a => a.status === "completed")
            .forEach(a => {
                const svc = serviceMap[String(a.service)];
                if (svc) totalRevenue += svc.price || 0;
            });

        // Weekly stats
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const weeklyAppointments = appointments.filter(a => new Date(a.createdAt) >= weekAgo).length;

        // Today's appointments
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);
        const todayAppointments = appointments.filter(a => {
            const t = new Date(a.startTime);
            return t >= todayStart && t <= todayEnd && a.status !== "cancelled";
        }).length;

        return res.json({
            data: {
                business,
                employees: employees.length,
                services: services.length,
                appointments: {
                    total: appointments.length,
                    scheduled,
                    completed,
                    cancelled,
                },
                todayAppointments,
                weeklyAppointments,
                totalRevenue,
            },
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Get the business owner's business info.
 */
export const getMyBusiness = async (req, res, next) => {
    try {
        const businessId = req.user.businessId;
        const business = await Business.findById(businessId).lean();
        if (!business) return res.status(404).json({ message: "Business not found" });
        return res.json({ data: business });
    } catch (err) {
        next(err);
    }
};

/**
 * Update the business owner's business info.
 */
export const updateMyBusiness = async (req, res, next) => {
    try {
        const businessId = req.user.businessId;
        const { name, niche, address, phone } = req.body;

        const business = await Business.findById(businessId);
        if (!business) return res.status(404).json({ message: "Business not found" });

        if (name) business.name = name;
        if (niche !== undefined) business.niche = niche;
        if (address !== undefined) business.address = address;
        if (phone !== undefined) business.phone = phone;

        await business.save();
        return res.json({ message: "Business updated", data: business });
    } catch (err) {
        next(err);
    }
};

/**
 * Get employees for the business owner's business.
 */
export const getMyEmployees = async (req, res, next) => {
    try {
        const businessId = req.user.businessId;
        const employees = await Employee.find({ businessId })
            .select("-passwordHash")
            .lean();
        return res.json({ data: employees });
    } catch (err) {
        next(err);
    }
};

/**
 * Remove an employee from the business.
 */
export const removeEmployee = async (req, res, next) => {
    try {
        const businessId = req.user.businessId;
        const { id } = req.params;

        const employee = await Employee.findById(id);
        if (!employee) return res.status(404).json({ message: "Employee not found" });
        if (String(employee.businessId) !== String(businessId)) {
            return res.status(403).json({ message: "This employee does not belong to your business" });
        }

        await User.findByIdAndDelete(id);
        return res.json({ message: "Employee removed" });
    } catch (err) {
        next(err);
    }
};

/**
 * Get services for the business owner's business.
 */
export const getMyServices = async (req, res, next) => {
    try {
        const businessId = req.user.businessId;
        const services = await Service.find({ business: businessId }).lean();
        return res.json({ data: services });
    } catch (err) {
        next(err);
    }
};

/**
 * Create a service for the business owner's business.
 */
export const createMyService = async (req, res, next) => {
    try {
        const businessId = req.user.businessId;
        const { name, description, durationMinutes, price, category } = req.body;

        if (!name || !durationMinutes || !price) {
            return res.status(400).json({ message: "Name, duration, and price are required" });
        }

        const service = await Service.create({
            business: businessId,
            name,
            description,
            durationMinutes,
            price,
            category,
        });

        return res.status(201).json({ message: "Service created", data: service });
    } catch (err) {
        next(err);
    }
};

/**
 * Update a service belonging to the business owner's business.
 */
export const updateMyService = async (req, res, next) => {
    try {
        const businessId = req.user.businessId;
        const { id } = req.params;

        const service = await Service.findById(id);
        if (!service) return res.status(404).json({ message: "Service not found" });
        if (String(service.business) !== String(businessId)) {
            return res.status(403).json({ message: "Service does not belong to your business" });
        }

        const { name, description, durationMinutes, price, category } = req.body;
        if (name) service.name = name;
        if (description !== undefined) service.description = description;
        if (durationMinutes) service.durationMinutes = durationMinutes;
        if (price !== undefined) service.price = price;
        if (category !== undefined) service.category = category;

        await service.save();
        return res.json({ message: "Service updated", data: service });
    } catch (err) {
        next(err);
    }
};

/**
 * Delete a service belonging to the business owner's business.
 */
export const deleteMyService = async (req, res, next) => {
    try {
        const businessId = req.user.businessId;
        const { id } = req.params;

        const service = await Service.findById(id);
        if (!service) return res.status(404).json({ message: "Service not found" });
        if (String(service.business) !== String(businessId)) {
            return res.status(403).json({ message: "Service does not belong to your business" });
        }

        await Service.findByIdAndDelete(id);
        return res.json({ message: "Service deleted" });
    } catch (err) {
        next(err);
    }
};

/**
 * Get appointments for the business owner's business.
 */
export const getMyAppointments = async (req, res, next) => {
    try {
        const businessId = req.user.businessId;
        const { status, from, to } = req.query;
        const q = { businessId };

        if (status) q.status = status;
        if (from || to) {
            q.startTime = {};
            if (from) q.startTime.$gte = new Date(from);
            if (to) q.startTime.$lte = new Date(to);
        }

        const appointments = await Appointment.find(q)
            .sort({ startTime: -1 })
            .populate("client", "name email phone")
            .populate("employee", "name email phone")
            .populate("service", "name durationMinutes price")
            .lean();

        return res.json({ data: appointments });
    } catch (err) {
        next(err);
    }
};

/**
 * Update an appointment status for the business owner's business.
 */
export const updateAppointmentStatus = async (req, res, next) => {
    try {
        const businessId = req.user.businessId;
        const { id } = req.params;
        const { status } = req.body;

        const allowed = ["scheduled", "cancelled", "completed"];
        if (!allowed.includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        const appt = await Appointment.findById(id);
        if (!appt) return res.status(404).json({ message: "Appointment not found" });
        if (String(appt.businessId) !== String(businessId)) {
            return res.status(403).json({ message: "Appointment does not belong to your business" });
        }

        appt.status = status;
        await appt.save();
        return res.json({ message: "Status updated", data: appt });
    } catch (err) {
        next(err);
    }
};
