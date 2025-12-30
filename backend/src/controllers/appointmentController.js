// controllers/appointmentController.js
import Appointment from "../models/Appointment.js";
import Employee from "../models/Employee.js"; // discriminator(role=employee)
import Service from "../models/Service.js";

export const createAppointment = async (req, res, next) => {
  try {
    const { businessId, employeeId, serviceId, startTime, endTime, notes } = req.body;

    // must be logged-in client
    const clientId = req.user?.id;
    const role = req.user?.role;
    if (!clientId) return res.status(401).json({ message: "Unauthorized" });
    if (role !== "client") return res.status(403).json({ message: "Only clients can create appointments" });

    if (!businessId || !employeeId || !serviceId || !startTime || !endTime) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const s = new Date(startTime);
    const e = new Date(endTime);
    if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) {
      return res.status(400).json({ message: "Invalid startTime/endTime" });
    }
    if (e <= s) return res.status(400).json({ message: "endTime must be after startTime" });

    // Validate employee (must be role=employee) + service belong to business
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
      employee: employeeId,
      status: { $ne: "cancelled" },
      startTime: { $lt: e },
      endTime: { $gt: s },
    }).lean();

    if (conflict) return res.status(409).json({ message: "Time slot is not available" });

    const appt = await Appointment.create({
      businessId,
      client: clientId,
      employee: employeeId,
      service: serviceId,
      startTime: s,
      endTime: e,
      status: "scheduled",
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

    // Basic authorization: business user can only access his own business
    if (req.user?.role === "business" && String(req.user.businessId) !== String(businessId)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    // Optional: employees can also view their business appointments
    if (req.user?.role === "employee") {
      // employee is a User too; but token should include businessId (recommended)
      if (req.user.businessId && String(req.user.businessId) !== String(businessId)) {
        return res.status(403).json({ message: "Forbidden" });
      }
    }

    const { from, to, employeeId, status } = req.query;

    const q = { businessId };
    if (employeeId) q.employee = employeeId;
    if (status) q.status = status;

    if (from || to) {
      q.startTime = {};
      if (from) q.startTime.$gte = new Date(from);
      if (to) q.startTime.$lte = new Date(to);
    }

    const appointments = await Appointment.find(q)
      .sort({ startTime: 1 })
      .populate("client", "name email phone role")
      .populate("employee", "name email phone role businessId")
      .populate("service", "name duration price")
      .lean();

    return res.json({ appointments });
  } catch (err) {
    next(err);
  }
};

export const getMyAppointments = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { from, to, status } = req.query;

    const q = {};
    // Client sees appointments where he is the client
    if (role === "client") q.client = userId;
    // Employee sees appointments where he is the employee
    else if (role === "employee") q.employee = userId;
    else return res.status(403).json({ message: "Forbidden" });

    if (status) q.status = status;

    if (from || to) {
      q.startTime = {};
      if (from) q.startTime.$gte = new Date(from);
      if (to) q.startTime.$lte = new Date(to);
    }

    const appointments = await Appointment.find(q)
      .sort({ startTime: -1 })
      .populate("service", "name duration price")
      .lean();

    return res.json({ appointments });
  } catch (err) {
    next(err);
  }
};

export const updateAppointmentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Match your Appointment model enum:
    const allowed = ["scheduled", "cancelled", "completed"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const appt = await Appointment.findById(id);
    if (!appt) return res.status(404).json({ message: "Appointment not found" });

    const userId = req.user?.id;
    const role = req.user?.role;

    // Client can cancel only his own appointment
    if (role === "client") {
      if (String(appt.client) !== String(userId)) return res.status(403).json({ message: "Forbidden" });
      if (status !== "cancelled") return res.status(403).json({ message: "Client can only cancel" });
    }

    // Employee can complete only his own appointment (optional rule)
    if (role === "employee") {
      if (String(appt.employee) !== String(userId)) return res.status(403).json({ message: "Forbidden" });
      if (status !== "completed" && status !== "cancelled") {
        return res.status(403).json({ message: "Employee can only complete/cancel" });
      }
    }

    // Business/admin can update anything (you can refine)
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

    // Usually: set status=cancelled instead of delete
    const deleted = await Appointment.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Appointment not found" });

    return res.json({ message: "Appointment deleted" });
  } catch (err) {
    next(err);
  }
};
