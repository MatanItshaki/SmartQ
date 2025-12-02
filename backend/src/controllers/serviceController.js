import Service from "../models/Service.js";

export const getServices = async (req, res, next) => {
  try {
    const services = await Service.find().populate("business");
    res.json(services);
  } catch (err) {
    next(err);
  }
};

export const createService = async (req, res, next) => {
  try {
    const service = await Service.create(req.body);
    res.status(201).json(service);
  } catch (err) {
    next(err);
  }
};
