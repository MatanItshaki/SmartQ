import Business from "../models/Business.js";

// helper - build update object safely (no undefined overwrite)
const pickDefined = (obj) =>
  Object.fromEntries(Object.entries(obj).filter(([_, v]) => v !== undefined));

export const createBusiness = async (req, res, next) => {
  try {
    const { name, niche, address, phone } = req.body;

    if (!name) return res.status(400).json({ message: "Business name is required" });

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

export const getAllBusinesses = async (req, res, next) => {
  try {
    const businesses = await Business.find().lean();
    return res.json({ success: true, count: businesses.length, data: businesses });
  } catch (err) {
    next(err);
  }
};

export const getBusinessById = async (req, res, next) => {
  try {
    const business = await Business.findById(req.params.id).lean();
    if (!business) return res.status(404).json({ message: "Business not found" });

    return res.json({ success: true, data: business });
  } catch (err) {
    next(err);
  }
};

export const updateBusiness = async (req, res, next) => {
  try {
    const { id } = req.params;

    // ✅ Authorization:
    // business user can update only his own business
    if (req.user?.role === "business" && String(req.user.businessId) !== String(id)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const updates = pickDefined({
      name: req.body.name?.trim(),
      niche: req.body.niche?.trim(),
      address: req.body.address?.trim(),
      phone: req.body.phone?.trim(),
    });

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

export const deleteBusiness = async (req, res, next) => {
  try {
    const { id } = req.params;

    // ✅ Authorization:
    if (req.user?.role === "business" && String(req.user.businessId) !== String(id)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const business = await Business.findByIdAndDelete(id);
    if (!business) return res.status(404).json({ message: "Business not found" });

    return res.json({ success: true, message: "Business deleted" });
  } catch (err) {
    next(err);
  }
};
