import Client from "../models/Client.js";

// GET /api/clients
export const getClients = async (req, res, next) => {
  try {
    const clients = await Client.find().select("-password");
    res.json(clients);
  } catch (err) {
    next(err);
  }
};

// GET /api/clients/:id
export const getClientById = async (req, res, next) => {
  try {
    const client = await Client.findById(req.params.id).select("-password");
    if (!client) return res.status(404).json({ message: "Client not found" });
    res.json(client);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/clients/:id
export const updateClient = async (req, res, next) => {
  try {
    const { name, email, phone } = req.body;

    const updated = await Client.findByIdAndUpdate(
      req.params.id,
      { ...(name && { name }), ...(email && { email }), ...(phone && { phone }) },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updated) return res.status(404).json({ message: "Client not found" });
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/clients/:id
export const deleteClient = async (req, res, next) => {
  try {
    const deleted = await Client.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Client not found" });
    res.json({ message: "Client deleted" });
  } catch (err) {
    next(err);
  }
};
