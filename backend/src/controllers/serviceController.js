import Service from "../models/Service.js";

// @desc    Create new service
// @route   POST /api/services
// @access  Public (for now)
export const createService = async (req, res, next) => {
  try {
    const { business, name, description, durationMinutes, price, category } = req.body;

    if (!business || !name || !durationMinutes || price == null) {
      const error = new Error("business, name, durationMinutes and price are required");
      error.statusCode = 400;
      throw error;
    }

    const service = await Service.create({
      business,
      name,
      description,
      durationMinutes,
      price,
      category,
    });

    res.status(201).json({
      success: true,
      data: service,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all services
// @route   GET /api/services
// @access  Public
export const getAllServices = async (req, res, next) => {
  try {
    // optional filter by business: /api/services?business=<id>
    const query = {};
    if (req.query.business) {
      query.business = req.query.business;
    }

    const services = await Service.find(query).populate("business", "name");

    res.json({
      success: true,
      count: services.length,
      data: services,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single service by id
// @route   GET /api/services/:id
// @access  Public
export const getServiceById = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id).populate("business", "name");

    if (!service) {
      const error = new Error("Service not found");
      error.statusCode = 404;
      throw error;
    }

    res.json({
      success: true,
      data: service,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update service
// @route   PUT /api/services/:id
// @access  Public (for now)
export const updateService = async (req, res, next) => {
  try {
    const { name, description, durationMinutes, price, category } = req.body;

    const service = await Service.findByIdAndUpdate(
      req.params.id,
      { name, description, durationMinutes, price, category },
      { new: true, runValidators: true }
    );

    if (!service) {
      const error = new Error("Service not found");
      error.statusCode = 404;
      throw error;
    }

    res.json({
      success: true,
      data: service,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete service
// @route   DELETE /api/services/:id
// @access  Public (for now)
export const deleteService = async (req, res, next) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);

    if (!service) {
      const error = new Error("Service not found");
      error.statusCode = 404;
      throw error;
    }

    res.json({
      success: true,
      message: "Service deleted",
    });
  } catch (err) {
    next(err);
  }
};
