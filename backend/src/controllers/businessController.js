// controllers/businessController.js
import Business from "../models/Business.js";
import Employee from "../models/Employee.js"; // Make sure to import Employee model

/**
 * Helper Function: buildUpdateObject
 * Filters out undefined values from an object to prevent overwriting
 * existing database fields with 'undefined'.
 */
const pickDefined = (obj) =>
  Object.fromEntries(Object.entries(obj).filter(([_, v]) => v !== undefined));

/**
 * Creates a new business.
 * 
 * Validates input and checks for duplicate business names.
 * requires Admin role.
 * 
 * @param {import("express").Request} req - Express request object.
 * @param {import("express").Response} res - Express response object.
 * @param {import("express").NextFunction} next - Express next middleware function.
 * @returns {Promise<void>}
 */
export const createBusiness = async (req, res, next) => {
  try {
    const { name, niche, address, phone } = req.body;

    // Basic validation for required fields
    if (!name) return res.status(400).json({ message: "Business name is required" });

    // CHECK FOR DUPLICATE: Case-insensitive search
    const normalizedName = name.trim();
    const exists = await Business.findOne({ 
      name: { $regex: new RegExp(`^${normalizedName}$`, 'i') } 
    }).lean();

    if (exists) {
      return res.status(409).json({ message: "A business with this name already exists" });
    }

    // Create business with trimmed string values
    const business = await Business.create({
      name: name.trim(),
      niche: niche?.trim(),
      address: address?.trim(),
      phone: phone?.trim(),
    });

    return res.status(201).json({ success: true, data: business });
  } catch (err) {
    next(err);
  }
};

/**
 * Retrieves all businesses.
 * 
 * @param {import("express").Request} req - Express request object.
 * @param {import("express").Response} res - Express response object.
 * @param {import("express").NextFunction} next - Express next middleware function.
 * @returns {Promise<void>}
 */
export const getAllBusinesses = async (req, res, next) => {
  try {
    // Fetch all documents using lean() for better performance (POJO instead of Mongoose docs)
    const businesses = await Business.find().lean();
    return res.json({ success: true, count: businesses.length, data: businesses });
  } catch (err) {
    next(err);
  }
};

/**
 * Retrieves a single business by its ID.
 * 
 * @param {import("express").Request} req - Express request object.
 * @param {import("express").Response} res - Express response object.
 * @param {import("express").NextFunction} next - Express next middleware function.
 * @returns {Promise<void>}
 */
export const getBusinessById = async (req, res, next) => {
  try {
    const business = await Business.findById(req.params.id).lean();
    if (!business) return res.status(404).json({ message: "Business not found" });

    return res.json({ success: true, data: business });
  } catch (err) {
    next(err);
  }
};

/**
 * Updates business details.
 * 
 * Enforces authorization:
 * - Admin can update any business.
 * - Business owners can only update their own business.
 * 
 * @param {import("express").Request} req - Express request object.
 * @param {import("express").Response} res - Express response object.
 * @param {import("express").NextFunction} next - Express next middleware function.
 * @returns {Promise<void>}
 */
export const updateBusiness = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Authorization Check:
    // A user with 'business' role is restricted to updating only their assigned businessId.
    if (req.user?.role === "business" && String(req.user.businessId) !== String(id)) {
      return res.status(403).json({ message: "Forbidden: You can only update your own business" });
    }

    // Build the update object safely using the helper
    const updates = pickDefined({
      name: req.body.name?.trim(),
      niche: req.body.niche?.trim(),
      address: req.body.address?.trim(),
      phone: req.body.phone?.trim(),
    });

    // Perform update and return the new document after validation
    const business = await Business.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!business) return res.status(404).json({ message: "Business not found" });

    return res.json({ success: true, data: business });
  } catch (err) {
    next(err);
  }
};

/**
 * Deletes a business.
 * 
 * Enforces authorization:
 * - Admin can delete any business.
 * - Business owners can only delete their own business.
 * 
 * @param {import("express").Request} req - Express request object.
 * @param {import("express").Response} res - Express response object.
 * @param {import("express").NextFunction} next - Express next middleware function.
 * @returns {Promise<void>}
 */
export const deleteBusiness = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Authorization Check:
    // Ensure the business user is not deleting another business entity.
    if (req.user?.role === "business" && String(req.user.businessId) !== String(id)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const business = await Business.findByIdAndDelete(id);
    if (!business) return res.status(404).json({ message: "Business not found" });

    return res.json({ success: true, message: "Business deleted successfully" });
  } catch (err) {
    next(err);
  }
};

/**
 * Retrieves all employees associated with a specific business.
 * 
 * @param {import("express").Request} req - Express request object.
 * @param {import("express").Response} res - Express response object.
 * @param {import("express").NextFunction} next - Express next middleware function.
 * @returns {Promise<void>}
 */
export const getEmployeesByBusiness = async (req, res, next) => {
  try {
    const { id } = req.params;
    const employees = await Employee.find({ businessId: id }).lean();
    return res.json({ success: true, count: employees.length, data: employees });
  } catch (err) {
    next(err);
  }
};