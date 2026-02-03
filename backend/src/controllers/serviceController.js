import Service from "../models/Service.js";

// Helper: Removes undefined values from an object to prevent overwriting DB fields with undefined
const pickDefined = (obj) =>
  Object.fromEntries(Object.entries(obj).filter(([_, v]) => v !== undefined));

// Helper: Throws error if business user tries to access resources of another business
const assertBusinessAccess = (req, businessId) => {
  // business users can only access their own business resources
  if (req.user?.role === "business" && String(req.user.businessId) !== String(businessId)) {
    const err = new Error("Forbidden");
    err.statusCode = 403;
    throw err;
  }
};

/**
 * Creates a new service for a business.
 * 
 * Validates required fields such as business ID, name, duration, and price.
 * Enforces authorization: Business users can only create services for their own business.
 * 
 * @param {import("express").Request} req - Express request object.
 * @param {import("express").Response} res - Express response object.
 * @param {import("express").NextFunction} next - Express next middleware function.
 * @returns {Promise<void>}
 */
export const createService = async (req, res, next) => {
  try {
    const { business, name, description, durationMinutes, price, category } = req.body;

    if (!business || !name || !durationMinutes || price == null) {
      return res.status(400).json({
        message: "business, name, durationMinutes and price are required",
      });
    }

    // Authorization
    assertBusinessAccess(req, business);

    const service = await Service.create({
      business,
      name: name.trim(),
      description: description?.trim(),
      durationMinutes,
      price,
      category: category?.trim(),
    });

    return res.status(201).json({ success: true, data: service });
  } catch (err) {
    next(err);
  }
};

/**
 * Retrieves all services, optionally filtered by business ID.
 * 
 * @param {import("express").Request} req - Express request object.
 * @param {import("express").Response} res - Express response object.
 * @param {import("express").NextFunction} next - Express next middleware function.
 * @returns {Promise<void>}
 */
export const getAllServices = async (req, res, next) => {
  try {
    const query = {};
    if (req.query.business) {
      query.business = req.query.business;
    }

    const services = await Service.find(query).populate("business", "name").lean();

    return res.json({ success: true, count: services.length, data: services });
  } catch (err) {
    next(err);
  }
};

/**
 * Retrieves a single service by its ID, including the business name.
 * 
 * @param {import("express").Request} req - Express request object.
 * @param {import("express").Response} res - Express response object.
 * @param {import("express").NextFunction} next - Express next middleware function.
 * @returns {Promise<void>}
 */
export const getServiceById = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id).populate("business", "name").lean();

    if (!service) return res.status(404).json({ message: "Service not found" });

    return res.json({ success: true, data: service });
  } catch (err) {
    next(err);
  }
};

/**
 * Updates a service by its ID.
 * 
 * Enforces authorization: Business users can only update their own services.
 * 
 * @param {import("express").Request} req - Express request object.
 * @param {import("express").Response} res - Express response object.
 * @param {import("express").NextFunction} next - Express next middleware function.
 * @returns {Promise<void>}
 */
export const updateService = async (req, res, next) => {
  try {
    // קודם מביאים את השירות כדי לבדוק הרשאות
    const existing = await Service.findById(req.params.id).lean();
    if (!existing) return res.status(404).json({ message: "Service not found" });

    // Authorization
    assertBusinessAccess(req, existing.business);

    const updates = pickDefined({
      name: req.body.name?.trim(),
      description: req.body.description?.trim(),
      durationMinutes: req.body.durationMinutes,
      price: req.body.price,
      category: req.body.category?.trim(),
    });

    const service = await Service.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    return res.json({ success: true, data: service });
  } catch (err) {
    next(err);
  }
};

/**
 * Deletes a service by its ID.
 * 
 * Enforces authorization: Business users can only delete their own services.
 * 
 * @param {import("express").Request} req - Express request object.
 * @param {import("express").Response} res - Express response object.
 * @param {import("express").NextFunction} next - Express next middleware function.
 * @returns {Promise<void>}
 */
export const deleteService = async (req, res, next) => {
  try {
    const existing = await Service.findById(req.params.id).lean();
    if (!existing) return res.status(404).json({ message: "Service not found" });

    // Authorization
    assertBusinessAccess(req, existing.business);

    await Service.findByIdAndDelete(req.params.id);

    return res.json({ success: true, message: "Service deleted" });
  } catch (err) {
    next(err);
  }
};
