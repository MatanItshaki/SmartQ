import Business from "../models/Business.js";

// @desc    Create new business
// @route   POST /api/business
// @access  Public (for now)
export const createBusiness = async (req, res, next) => {
  try {
    const { name, niche, address, phone } = req.body;

    if (!name) {
      const error = new Error("Business name is required");
      error.statusCode = 400;
      throw error;
    }

    const business = await Business.create({
      name,
      niche,
      address,
      phone,
    });

    res.status(201).json({
      success: true,
      data: business,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all businesses
// @route   GET /api/business
// @access  Public
export const getAllBusinesses = async (req, res, next) => {
  try {
    const businesses = await Business.find();

    res.json({
      success: true,
      count: businesses.length,
      data: businesses,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single business by id
// @route   GET /api/business/:id
// @access  Public
export const getBusinessById = async (req, res, next) => {
  try {
    const business = await Business.findById(req.params.id);

    if (!business) {
      const error = new Error("Business not found");
      error.statusCode = 404;
      throw error;
    }

    res.json({
      success: true,
      data: business,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update business
// @route   PUT /api/business/:id
// @access  Public (for now)
export const updateBusiness = async (req, res, next) => {
  try {
    const { name, niche, address, phone } = req.body;

    const business = await Business.findByIdAndUpdate(
      req.params.id,
      { name, niche, address, phone },
      { new: true, runValidators: true }
    );

    if (!business) {
      const error = new Error("Business not found");
      error.statusCode = 404;
      throw error;
    }

    res.json({
      success: true,
      data: business,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete business
// @route   DELETE /api/business/:id
// @access  Public (for now)
export const deleteBusiness = async (req, res, next) => {
  try {
    const business = await Business.findByIdAndDelete(req.params.id);

    if (!business) {
      const error = new Error("Business not found");
      error.statusCode = 404;
      throw error;
    }

    res.json({
      success: true,
      message: "Business deleted",
    });
  } catch (err) {
    next(err);
  }
};
