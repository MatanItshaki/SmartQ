import Business from "../models/Business.js";

export const getAllBusinesses = async (req, res) => {
  try {
    const businesses = await Business.find();
    res.json(businesses);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const createBusiness = async (req, res) => {
  try {
    const business = await Business.create(req.body);
    res.status(201).json(business);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }


};


export const getBusinessById = async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);
    if (!business) return res.status(404).json({ message: "Not found" });
    res.json(business);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
