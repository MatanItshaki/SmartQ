// controllers/appointmentController.js
import Appointment from "../models/Appointment.js";
import Employee from "../models/Employee.js";
import Service from "../models/Service.js";

// helper: wrap async to forward errors to errorMiddleware
export const createAppointment = async (req, res, next) => {
  try {
    const { businessId, employeeId, serviceId, startTime, endTime, notes } = req.body;

    // must be logged-in client
    const clientId = req.user?.id;
    if (!clientId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!businessId || !employeeId || !serviceId || !startTime || !endTime) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const s = new Date(startTime);
    const e = new Date(endTime);

    if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) {
      return res.status(400).json({ message: "Invalid startTime/endTime" });
    }
    if (e <= s) {
      return res.status(400).json({ message: "endTime must be after startTime" });
    }

    // Validate employee + service belong to business
    const [employee, service] = await Promise.all([
      Employee.findById(employeeId).lean(),
      Service.findById(serviceId).lean(),
    ]);

    if (!employee) return res.status(404).json({ message: "Employee not found" });
    if (!service) return res.status(404).json({ message: "Service not found" });

    if (String(employee.businessId) !== String(businessId)) {
      return res.status(400).json({ message: "Employee does not belong to this business" });
    }
    if (String(service.businessId) !== String(businessId)) {
      return res.status(400).json({ message: "Service does not belong to this business" });
    }

    // Overlap check (avoid double booking)
    // overlap condition: existing.start < newEnd AND existing.end > newStart
    const conflict = await Appointment.findOne({
      businessId,
      employeeId,
      status: { $nin: ["cancelled"] },
      startTime: { $lt: e },
      endTime: { $gt: s },
    }).lean();

    if (conflict) {
      return res.status(409).json({ message: "Time slot is not available" });
    }

    const appt = await Appointment.create({
      businessId,
      clientId,
      employeeId,
      serviceId,
      startTime: s,
      endTime: e,
      status: "pending",
      notes: notes ?? "",
    });

    return res.status(201).json({ message: "Appointment created", appointment: appt });
  } catch (err) {
    next(err);
  }
};

export const getBusinessAppointments = async (req, res, next) => {
  try {
    const { businessId } = req.params;

    // Optional filters
    const { from, to, employeeId, status } = req.query;

    const q = { businessId };
    if (employeeId) q.employeeId = employeeId;
    if (status) q.status = status;

    if (from || to) {
      q.startTime = {};
      if (from) q.startTime.$gte = new Date(from);
      if (to) q.startTime.$lte = new Date(to);
    }

    const appointments = await Appointment.find(q)
      .sort({ startTime: 1 })
      .lean();

    return res.json({ appointments });
  } catch (err) {
    next(err);
  }
};

export const getMyAppointments = async (req, res, next) => {
  try {
    const clientId = req.user?.id;
    if (!clientId) return res.status(401).json({ message: "Unauthorized" });

    const { from, to, status } = req.query;

    const q = { clientId };
    if (status) q.status = status;

    if (from || to) {
      q.startTime = {};
      if (from) q.startTime.$gte = new Date(from);
      if (to) q.startTime.$lte = new Date(to);
    }

    const appointments = await Appointment.find(q).sort({ startTime: -1 }).lean();
    return res.json({ appointments });
  } catch (err) {
    next(err);
  }
};

export const updateAppointmentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowed = ["pending", "confirmed", "cancelled", "completed", "no_show"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const appt = await Appointment.findById(id);
    if (!appt) return res.status(404).json({ message: "Appointment not found" });

    // Basic authorization idea:
    // - Client can only cancel his own appointment
    // - Business/admin can update others (you can expand this later)
    const userId = req.user?.id;
    const role = req.user?.role; // e.g. "client" | "business" | "admin"

    if (role === "client") {
      if (String(appt.clientId) !== String(userId)) {
        return res.status(403).json({ message: "Forbidden" });
      }
      // client should not confirm/complete/no_show
      if (status !== "cancelled") {
        return res.status(403).json({ message: "Client can only cancel" });
      }
    }

    appt.status = status;
    await appt.save();

    return res.json({ message: "Status updated", appointment: appt });
  } catch (err) {
    next(err);
  }
};

export const deleteAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Usually you DON'T delete appointments; you set status=cancelled.
    // Keep this endpoint if you want admin-only cleanup.
    const deleted = await Appointment.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Appointment not found" });

    return res.json({ message: "Appointment deleted" });
  } catch (err) {
    next(err);
  }
};
