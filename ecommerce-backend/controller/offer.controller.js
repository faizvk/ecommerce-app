import mongoose from "mongoose";
import Offer from "../model/offer.model.js";

/* ---------------- ADMIN: CREATE ---------------- */
export const createOffer = async (req, res) => {
  try {
    const { title, discountValue, endTime, productIds = [] } = req.body;

    if (!title?.trim()) return res.status(400).json({ message: "Title is required" });
    if (discountValue == null || discountValue < 0) return res.status(400).json({ message: "Valid discount value required" });
    if (!endTime) return res.status(400).json({ message: "End time is required" });
    if (new Date(endTime) <= new Date()) return res.status(400).json({ message: "End time must be in the future" });
    if (!Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({ message: "Select at least one product for the offer" });
    }

    const offer = await Offer.create({
      ...req.body,
      createdBy: req.user.id,
    });

    res.status(201).json({ success: true, message: "Offer created", offer });
  } catch (error) {
    res.status(500).json({ message: "Failed to create offer", error: error.message });
  }
};

/* ---------------- PUBLIC: GET ACTIVE OFFERS ---------------- */
export const getActiveOffers = async (req, res) => {
  try {
    const now = new Date();
    const offers = await Offer.find({
      active: true,
      startTime: { $lte: now },
      endTime: { $gt: now },
    })
      .populate("productIds", "name salePrice costPrice image category stock")
      .sort({ createdAt: -1 })
      .lean({ virtuals: true });

    res.json({ success: true, offers });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch active offers", error: error.message });
  }
};

/* ---------------- ADMIN: GET ALL OFFERS ---------------- */
export const getAllOffers = async (req, res) => {
  try {
    const offers = await Offer.find()
      .populate("productIds", "name salePrice image")
      .sort({ createdAt: -1 })
      .lean({ virtuals: true });

    const now = new Date();
    const enriched = offers.map((o) => ({
      ...o,
      isLive: o.active && new Date(o.startTime) <= now && new Date(o.endTime) > now,
      isExpired: new Date(o.endTime) <= now,
    }));

    res.json({ success: true, offers: enriched });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch offers", error: error.message });
  }
};

/* ---------------- ADMIN: UPDATE ---------------- */
export const updateOffer = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid offer ID" });
    }

    const updated = await Offer.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updated) return res.status(404).json({ message: "Offer not found" });

    res.json({ success: true, message: "Offer updated", offer: updated });
  } catch (error) {
    res.status(500).json({ message: "Failed to update offer", error: error.message });
  }
};

/* ---------------- ADMIN: DELETE ---------------- */
export const deleteOffer = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid offer ID" });
    }

    const offer = await Offer.findByIdAndDelete(id);
    if (!offer) return res.status(404).json({ message: "Offer not found" });

    res.json({ success: true, message: "Offer deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete offer", error: error.message });
  }
};
