import { Router, Request, Response } from "express";
import Item from "../models/Item";

const router = Router();

// GET /api/items — list approved items
router.get("/", async (_req: Request, res: Response) => {
  try {
    const items = await Item.find({ status: { $ne: "pending" } }).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: "Error fetching items", error: err });
  }
});

// GET /api/items/:id — single item
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      res.status(404).json({ message: "Item not found" });
      return;
    }
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: "Error fetching item", error: err });
  }
});

// POST /api/items — create item
router.post("/", async (req: Request, res: Response) => {
  try {
    const { title, shortDescription, fullDescription, price, date, category, imageUrl, status } = req.body;

    const item = new Item({
      title,
      shortDescription,
      fullDescription,
      price,
      date,
      category,
      imageUrl,
      status: status || "pending",
    });

    const saved = await item.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ message: "Error creating item", error: err });
  }
});

// PUT /api/items/:id — update item
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const { title, shortDescription, fullDescription, price, date, category, imageUrl } = req.body;
    const updated = await Item.findByIdAndUpdate(
      req.params.id,
      { title, shortDescription, fullDescription, price, date, category, imageUrl },
      { new: true, runValidators: true }
    );
    if (!updated) {
      res.status(404).json({ message: "Item not found" });
      return;
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Error updating item", error: err });
  }
});

// DELETE /api/items/:id — delete item
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const deleted = await Item.findByIdAndDelete(req.params.id);
    if (!deleted) {
      res.status(404).json({ message: "Item not found" });
      return;
    }
    res.json({ message: "Item deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting item", error: err });
  }
});

export default router;
