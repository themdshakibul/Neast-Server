import { Router, Response } from "express";
import Item from "../models/Item";
import { authenticate, AuthRequest } from "../middleware/auth";

const router = Router();

// GET /api/items — list approved items (public)
router.get("/", async (_req, res: Response) => {
  try {
    const items = await Item.find({ status: { $ne: "pending" } }).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: "Error fetching items", error: err });
  }
});

// GET /api/items/:id — single item (public)
router.get("/:id", async (req, res: Response) => {
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

// POST /api/items — create item (auth required)
router.post("/", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { title, shortDescription, fullDescription, price, date, category, imageUrl } = req.body;

    const item = new Item({
      title,
      shortDescription,
      fullDescription,
      price,
      date,
      category,
      imageUrl,
      userId: req.userId,
      status: "pending",
    });

    const saved = await item.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ message: "Error creating item", error: err });
  }
});

// PUT /api/items/:id — update item (auth required, owner only)
router.put("/:id", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      res.status(404).json({ message: "Item not found" });
      return;
    }

    if (item.userId !== req.userId) {
      res.status(403).json({ message: "Not authorized to update this item" });
      return;
    }

    const { title, shortDescription, fullDescription, price, date, category, imageUrl } = req.body;
    const updated = await Item.findByIdAndUpdate(
      req.params.id,
      { title, shortDescription, fullDescription, price, date, category, imageUrl },
      { new: true, runValidators: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Error updating item", error: err });
  }
});

// DELETE /api/items/:id — delete item (auth required, owner only)
router.delete("/:id", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      res.status(404).json({ message: "Item not found" });
      return;
    }

    if (item.userId !== req.userId) {
      res.status(403).json({ message: "Not authorized to delete this item" });
      return;
    }

    await Item.findByIdAndDelete(req.params.id);
    res.json({ message: "Item deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting item", error: err });
  }
});

export default router;
