import Business from "../models/Business.js";

export const getBusinesses = async (req, res, next) => {
  try {
    const businesses = await Business.find();
    res.json(businesses);
  } catch (err) {
    next(err);
  }
};

export const createBusiness = async (req, res, next) => {
  try {
    const business = await Business.create(req.body);
    res.status(201).json(business);
  } catch (err) {
    next(err);
  }
};
