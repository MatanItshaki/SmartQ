// controllers/appointmentController.js
import Appointment from "../models/Appointment.js";
import Employee from "../models/Employee.js"; // Discriminator for users with role: employee
import Service from "../models/Service.js";

/**
 * Creates a new appointment after performing security and business logic validations.
 */
export const createAppointment = async (req, res, next) => {
  try {
    const { businessId, employeeId, serviceId, startTime, endTime, notes } = req.body;

    // 1. Authentication and Authorization Check
    const clientId = req.user?.id;
    const role = req.user?.role;
    if (!clientId) return res.status(401).json({ message: "Unauthorized" });
    if (role !== "client") {
      return res.status(403).json({ message: "Only clients can create appointments" });
    }

    // 2. Basic Input Validation
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

    // 3. Cross-Reference Validation
    // Fetch employee and service simultaneously to optimize performance
    const [employee, service] = await Promise.all([
      Employee.findById(employeeId).lean(),
      Service.findById(serviceId).lean(),
    ]);

    if (!employee) return res.status(404).json({ message: "Employee not found" });
    if (!service) return res.status(404).json({ message: "Service not found" });

    // Validate that the employee belongs to the specified business
    if (String(employee.businessId) !== String(businessId)) {
      return res.status(400).json({ message: "Employee does not belong to this business" });
    }
    
    // Validate that the service belongs to the specified business (Matches 'business' field in Service model)
    if (String(service.business) !== String(businessId)) {
      return res.status(400).json({ message: "Service does not belong to this business" });
    }

    // 4. Overlap Check (Prevention of Double Booking)
    // Checks if any non-cancelled appointment exists for this employee within the requested time range
    const conflict = await Appointment.findOne({
      businessId,
      employee: employeeId,
      status: { $ne: "cancelled" },
      startTime: { $lt: e }, // Existing starts before new one ends
      endTime: { $gt: s },  // Existing ends after new one starts
    }).lean();

    if (conflict) {
      return res.status(409).json({ message: "Time slot is not available" });
    }

    // 5. Database Creation
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

/**
 * Fetches all appointments for a specific business with optional query filters.
 */
export const getBusinessAppointments = async (req, res, next) => {
  try {
    const { businessId } = req.params;

    // Authorization: Business owners can only see their own business data
    if (req.user?.role === "business" && String(req.user.businessId) !== String(businessId)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    // Authorization: Employees can only see their own business data
    if (req.user?.role === "employee" && req.user.businessId && String(req.user.businessId) !== String(businessId)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { from, to, employeeId, status } = req.query;
    const q = { businessId };

    if (employeeId) q.employee = employeeId;
    if (status) q.status = status;

    // Date range filtering
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

/**
 * Fetches appointments related to the logged-in user (Client's bookings or Employee's tasks).
 */
export const getMyAppointments = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;
    console.log(`getMyAppointments: UserID=${userId}, Role=${role}`);
    
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { from, to, status } = req.query;
    const q = {};

    if (role === "client") q.client = userId;
    else if (role === "employee") q.employee = userId;
    else return res.status(403).json({ message: "Forbidden" });

    console.log("getMyAppointments Query:", JSON.stringify(q));

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

/**
 * Updates the status of an appointment (e.g., cancelling or marking as completed).
 */
export const updateAppointmentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowed = ["scheduled", "cancelled", "completed"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const appt = await Appointment.findById(id);
    if (!appt) return res.status(404).json({ message: "Appointment not found" });

    const userId = req.user?.id;
    const role = req.user?.role;

    // Security: Clients can only cancel their own appointments
    if (role === "client") {
      if (String(appt.client) !== String(userId)) return res.status(403).json({ message: "Forbidden" });
      if (status !== "cancelled") return res.status(403).json({ message: "Client can only cancel" });
    }

    // Security: Employees can only complete or cancel their own appointments
    if (role === "employee") {
      if (String(appt.employee) !== String(userId)) return res.status(403).json({ message: "Forbidden" });
      if (status !== "completed" && status !== "cancelled") {
        return res.status(403).json({ message: "Employee can only complete/cancel" });
      }
    }

    appt.status = status;
    await appt.save();

    return res.json({ message: "Status updated", appointment: appt });
  } catch (err) {
    next(err);
  }
};

/**
 * Hard-deletes an appointment from the database.
 */
export const deleteAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;

    const deleted = await Appointment.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Appointment not found" });

    return res.json({ message: "Appointment deleted" });
  } catch (err) {
    next(err);
  }
};