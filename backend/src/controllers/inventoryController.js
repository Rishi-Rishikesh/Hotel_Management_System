import mongoose from "mongoose";
import Inventory from "../models/inventory.js";
import RoomInventory from "../models/RoomInventory.js";
import Guest from "../models/guestModel.js";
import { sendNotification } from "../utils/notification.js";

export const addInventoryItem = async (req, res) => {
  try {
    console.log(`addInventoryItem: ${req.method} ${req.originalUrl} - Starting`);
    console.log(`addInventoryItem: userId: ${req.userId}, role: ${req.userRole}`);
    const { pname, category, description, stock, roomIds } = req.body; // Added roomIds
    console.log(`addInventoryItem: Payload:`, { pname, category, description, stock, roomIds });

    if (!req.userId) {
      console.error(`addInventoryItem: Missing userId`);
      return res.status(401).json({ success: false, message: "User ID not found. Please authenticate" });
    }

    const guest = await Guest.findOne({ firebaseUid: req.userId });
    if (!guest) {
      console.error(`addInventoryItem: Guest not found for firebaseUid: ${req.userId}`);
      return res.status(404).json({ success: false, message: "User not found in database" });
    }
    console.log(`addInventoryItem: Guest found:`, { id: guest._id, email: guest.email });

    if (!pname || !category || stock === undefined) {
      console.log(`addInventoryItem: Missing required fields:`, { pname, category, stock });
      return res.status(400).json({ success: false, message: "Missing required fields: pname, category, stock" });
    }
    if (typeof stock !== "number" || stock < 0) {
      console.log(`addInventoryItem: Invalid stock value: ${stock}`);
      return res.status(400).json({ success: false, message: "Stock must be a non-negative number" });
    }

    const newItem = new Inventory({
      pname,
      category: category.toLowerCase(),
      description,
      stock,
      updatedBy: guest._id,
    });
    await newItem.save();
    console.log(`addInventoryItem: Item created:`, {
      id: newItem._id,
      pname: newItem.pname,
      stock: newItem.stock,
    });

    // Assign item to selected rooms
    if (roomIds && Array.isArray(roomIds) && roomIds.length > 0) {
      const roomInventories = roomIds.map(roomId => ({
        roomId,
        inventoryId: newItem._id,
        staffId: guest._id,
        action: "restock",
        quantity: 0, // Initial assignment, no stock deduction
      }));
      await RoomInventory.insertMany(roomInventories);
      console.log(`addInventoryItem: Assigned to ${roomIds.length} rooms`);
    }

    console.log(`addInventoryItem: Success`);
    res.status(201).json({ success: true, message: "Inventory item added", item: newItem });
  } catch (error) {
    console.error(`addInventoryItem: Error:`, {
      message: error.message,
      code: error.code,
      stack: error.stack,
    });
    if (error.name === "CastError") {
      return res.status(400).json({ success: false, message: `Invalid ID format: ${error.message}` });
    }
    if (error.name === "ValidationError") {
      return res.status(400).json({ success: false, message: `Validation error: ${error.message}` });
    }
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: "Item name already exists" });
    }
    res.status(500).json({ success: false, message: `Server error: ${error.message}` });
  }
};

export const updateRoomInventory = async (req, res) => {
  try {
    console.log(`updateRoomInventory: ${req.method} ${req.originalUrl} - Starting`);
    console.log(`updateRoomInventory: userId: ${req.userId}, role: ${req.userRole}`);
    const { roomId } = req.params;
    const { inventoryId, action, quantity, replacementReason } = req.body;
    console.log(`updateRoomInventory: Payload:`, { roomId, inventoryId, action, quantity, replacementReason });

    if (!req.userId) {
      console.error(`updateRoomInventory: Missing userId`);
      return res.status(401).json({ success: false, message: "User ID not found. Please authenticate" });
    }

    const guest = await Guest.findOne({ firebaseUid: req.userId });
    if (!guest) {
      console.error(`updateRoomInventory: Guest not found for firebaseUid: ${req.userId}`);
      return res.status(404).json({ success: false, message: "User not found in database" });
    }
    console.log(`updateRoomInventory: Guest found:`, { id: guest._id, email: guest.email, role: guest.role });

    if (!roomId) {
      console.log(`updateRoomInventory: Missing roomId`);
      return res.status(400).json({ success: false, message: "Room ID is required" });
    }
    if (!inventoryId) {
      console.log(`updateRoomInventory: Missing inventoryId`);
      return res.status(400).json({ success: false, message: "Inventory ID is required" });
    }
    if (!mongoose.Types.ObjectId.isValid(inventoryId)) {
      console.log(`updateRoomInventory: Invalid inventoryId: ${inventoryId}`);
      return res.status(400).json({ success: false, message: "Invalid inventory ID format" });
    }
    if (!["restock", "replacement"].includes(action)) {
      console.log(`updateRoomInventory: Invalid action: ${action}`);
      return res.status(400).json({ success: false, message: "Action must be 'restock' or 'replacement'" });
    }
    if (action === "restock") {
      if (quantity === undefined || quantity === null) {
        console.log(`updateRoomInventory: Missing quantity for restock`);
        return res.status(400).json({ success: false, message: "Quantity is required for restock" });
      }
      if (typeof quantity !== "number" || quantity < 0) {
        console.log(`updateRoomInventory: Invalid quantity: ${quantity}`);
        return res.status(400).json({ success: false, message: "Quantity must be a non-negative number" });
      }
    }
    if (action === "replacement" && !replacementReason) {
      console.log(`updateRoomInventory: Missing replacementReason for replacement`);
      return res.status(400).json({ success: false, message: "Replacement reason is required" });
    }

    const inventory = await Inventory.findById(inventoryId);
    if (!inventory) {
      console.log(`updateRoomInventory: Inventory not found for inventoryId: ${inventoryId}`);
      return res.status(404).json({ success: false, message: "Inventory item not found" });
    }
    console.log(`updateRoomInventory: Inventory found:`, { id: inventory._id, pname: inventory.pname, stock: inventory.stock });

    // Allow restock even with insufficient stock
    if (action === "restock") {
      const newStock = inventory.stock - quantity;
      await Inventory.findByIdAndUpdate(inventoryId, {
        $set: { stock: newStock, updatedBy: guest._id },
      });
      console.log(`updateRoomInventory: Stock updated for inventoryId: ${inventoryId}, new stock: ${newStock}`);
      // Notify admins if stock is low
      if (newStock < 5) {
        const admins = await Guest.find({ role: "Admin" });
        for (const admin of admins) {
          await sendNotification(
            admin.email,
            `Low stock alert: ${inventory.pname} has ${newStock} units remaining`
          );
        }
        console.log(`updateRoomInventory: Low stock notification sent to ${admins.length} admins`);
      }
    }

    const roomInventory = new RoomInventory({
      roomId,
      inventoryId,
      staffId: guest._id,
      action,
      quantity: action === "restock" ? quantity : 0,
      replacementReason: action === "replacement" ? replacementReason : undefined,
    });
    await roomInventory.save();
    console.log(`updateRoomInventory: Room inventory created:`, {
      id: roomInventory._id,
      roomId: roomInventory.roomId,
      action: roomInventory.action,
      staffId: roomInventory.staffId,
    });

    if (action === "replacement") {
      const admins = await Guest.find({ role: "Admin" });
      console.log(`updateRoomInventory: Found ${admins.length} admins for notification`);
      for (const admin of admins) {
        await sendNotification(admin.email, `Replacement request for ${inventory.pname} in Room ${roomId}: ${replacementReason}`);
      }
      console.log(`updateRoomInventory: Notifications sent to ${admins.length} admins`);
    }

    console.log(`updateRoomInventory: Success`);
    res.status(201).json({ success: true, message: "Inventory update submitted", update: roomInventory });
  } catch (error) {
    console.error(`updateRoomInventory: Error:`, {
      message: error.message,
      code: error.code,
      stack: error.stack,
    });
    if (error.name === "CastError") {
      return res.status(400).json({ success: false, message: `Invalid ID format: ${error.message}` });
    }
    if (error.name === "ValidationError") {
      return res.status(400).json({ success: false, message: `Validation error: ${error.message}` });
    }
    res.status(500).json({ success: false, message: `Server error: ${error.message}` });
  }
};

export const getInventoryHistory = async (req, res) => {
  try {
    console.log(`getInventoryHistory: ${req.method} ${req.originalUrl} - Starting`);
    console.log(`getInventoryHistory: userId: ${req.userId}, role: ${req.userRole}`);
    const { page = 1, limit = 10, status, roomId } = req.query;
    const query = {};

    if (status) {
      query.status = status;
      console.log(`getInventoryHistory: Filtering by status: ${status}`);
    }
    if (roomId) {
      query.roomId = roomId;
      console.log(`getInventoryHistory: Filtering by roomId: ${roomId}`);
    }
    // Allow staff to see all history unless filtered by their ID
    if (req.userRole === "Staff" && !req.query.staffId) {
      console.log(`getInventoryHistory: Staff viewing all history`);
    } else if (req.query.staffId) {
      query.staffId = req.query.staffId;
      console.log(`getInventoryHistory: Filtering by staffId: ${req.query.staffId}`);
    }

    console.log(`getInventoryHistory: Query:`, query);
    const updates = await RoomInventory.find(query)
      .populate({
        path: "inventoryId",
        select: "pname category",
      })
      .populate({
        path: "staffId",
        select: "email",
      })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    console.log(`getInventoryHistory: Updates fetched: ${updates.length}`);
    const total = await RoomInventory.countDocuments(query);
    console.log(`getInventoryHistory: Total documents: ${total}`);

    const formattedUpdates = updates
      .filter((update) => update.inventoryId && update.staffId)
      .map((update) => ({
        _id: update._id,
        roomId: update.roomId,
        inventory: {
          _id: update.inventoryId._id,
          pname: update.inventoryId.pname,
          category: update.inventoryId.category,
        },
        staffEmail: update.staffId.email,
        action: update.action,
        quantity: update.quantity,
        replacementReason: update.replacementReason,
        status: update.status,
        createdAt: update.createdAt,
      }));

    console.log(`getInventoryHistory: Formatted updates: ${formattedUpdates.length}`);
    console.log(`getInventoryHistory: Success`);

    res.status(200).json({
      success: true,
      updates: formattedUpdates,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
    });
  } catch (error) {
    console.error(`getInventoryHistory: Error:`, {
      message: error.message,
      code: error.code,
      stack: error.stack,
    });
    res.status(500).json({ success: false, message: `Server error: ${error.message}` });
  }
};

export const getProducts = async (req, res) => {
  try {
    console.log(`getProducts: ${req.method} ${req.originalUrl} - Starting`);
    console.log(`getProducts: userId: ${req.userId}, role: ${req.userRole}`);
    const { category } = req.query;
    const query = category ? { category: category.toLowerCase() } : {};
    console.log(`getProducts: Query:`, query);

    const products = await Inventory.find(query);
    console.log(`getProducts: Products fetched: ${products.length}`);

    if (products.length === 0) {
      console.log(`getProducts: No products found`);
      return res.status(404).json({ success: false, message: "No products found" });
    }

    console.log(`getProducts: Success`);
    res.status(200).json({ success: true, products });
  } catch (error) {
    console.error(`getProducts: Error:`, {
      message: error.message,
      code: error.code,
      stack: error.stack,
    });
    res.status(500).json({ success: false, message: `Server error: ${error.message}` });
  }
};

export const getRoomInventory = async (req, res) => {
  try {
    console.log(`getRoomInventory: ${req.method} ${req.originalUrl} - Starting`);
    console.log(`getRoomInventory: userId: ${req.userId}, role: ${req.userRole}`);
    const { roomId } = req.params;
    const { category } = req.query;
    const query = { roomId };
    if (category) query["inventoryId.category"] = category.toLowerCase();
    console.log(`getRoomInventory: Query:`, query);

    const roomInventories = await RoomInventory.find(query)
      .populate("inventoryId", "pname stock category")
      .lean();
    console.log(`getRoomInventory: Room inventories fetched: ${roomInventories.length}`);

    let items = roomInventories.map((ri) => ({
      _id: ri.inventoryId._id,
      pname: ri.inventoryId.pname,
      stock: ri.inventoryId.stock,
      category: ri.inventoryId.category,
    }));

    if (items.length === 0 && category) {
      const inventoryQuery = { category: category.toLowerCase() };
      const inventoryItems = await Inventory.find(inventoryQuery).lean();
      console.log(`getRoomInventory: Fallback inventory items fetched: ${inventoryItems.length}`);
      items = inventoryItems.map((item) => ({
        _id: item._id,
        pname: item.pname,
        stock: item.stock,
        category: item.category,
      }));
    }

    console.log(`getRoomInventory: Items returned: ${items.length}`);
    if (items.length === 0) {
      console.log(`getRoomInventory: No items found for roomId: ${roomId}`);
      return res.status(200).json({ success: true, items: [], message: `No inventory items found for Room ${roomId}` });
    }

    console.log(`getRoomInventory: Success`);
    res.status(200).json({ success: true, items });
  } catch (error) {
    console.error(`getRoomInventory: Error:`, {
      message: error.message,
      code: error.code,
      stack: error.stack,
    });
    res.status(500).json({ success: false, message: `Server error: ${error.message}` });
  }
};

export const deleteInventoryItem = async (req, res) => {
  try {
    console.log(`deleteInventoryItem: ${req.method} ${req.originalUrl} - Starting`);
    console.log(`deleteInventoryItem: userId: ${req.userId}, role: ${req.userRole}`);
    const { id } = req.params;
    console.log(`deleteInventoryItem: Inventory ID: ${id}`);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log(`deleteInventoryItem: Invalid inventory ID: ${id}`);
      return res.status(400).json({ success: false, message: "Invalid inventory ID format" });
    }

    const inventory = await Inventory.findById(id);
    if (!inventory) {
      console.log(`deleteInventoryItem: Inventory not found for ID: ${id}`);
      return res.status(404).json({ success: false, message: "Inventory item not found" });
    }
    console.log(`deleteInventoryItem: Inventory found:`, { id: inventory._id, pname: inventory.pname });

    const roomInventoryCount = await RoomInventory.countDocuments({ inventoryId: id });
    console.log(`deleteInventoryItem: Room inventory count: ${roomInventoryCount}`);
    if (roomInventoryCount > 0) {
      // Optionally delete room assignments
      await RoomInventory.deleteMany({ inventoryId: id });
      console.log(`deleteInventoryItem: Removed ${roomInventoryCount} room assignments`);
    }

    await Inventory.findByIdAndDelete(id);
    console.log(`deleteInventoryItem: Inventory deleted: ${id}`);
    console.log(`deleteInventoryItem: Success`);

    res.status(200).json({ success: true, message: "Inventory item deleted" });
  } catch (error) {
    console.error(`deleteInventoryItem: Error:`, {
      message: error.message,
      code: error.code,
      stack: error.stack,
    });
    res.status(500).json({ success: false, message: `Server error: ${error.message}` });
  }
};

export const updateInventoryStatus = async (req, res) => {
  try {
    console.log(`updateInventoryStatus: ${req.method} ${req.originalUrl} - Starting`);
    console.log(`updateInventoryStatus: userId: ${req.userId}, role: ${req.userRole}`);
    const { id } = req.params;
    const { status } = req.body;
    console.log(`updateInventoryStatus: Payload:`, { id, status });

    if (!["approved", "rejected"].includes(status)) {
      console.log(`updateInventoryStatus: Invalid status: ${status}`);
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const update = await RoomInventory.findById(id);
    if (!update) {
      console.log(`updateInventoryStatus: Update not found for ID: ${id}`);
      return res.status(404).json({ success: false, message: "Update not found" });
    }
    console.log(`updateInventoryStatus: Update found:`, { id: update._id, action: update.action });

    if (update.action === "replacement" && status === "approved") {
      const inventory = await Inventory.findById(update.inventoryId);
      if (!inventory) {
        console.log(`updateInventoryStatus: Inventory not found for ID: ${update.inventoryId}`);
        return res.status(404).json({ success: false, message: "Inventory item not found" });
      }
      console.log(`updateInventoryStatus: Inventory stock: ${inventory.stock}`);
      if (inventory.stock < 1) {
        console.log(`updateInventoryStatus: No stock available for replacement`);
        return res.status(400).json({ success: false, message: "No stock available for replacement" });
      }
      await Inventory.findByIdAndUpdate(update.inventoryId, { $inc: { stock: -1 } });
      console.log(`updateInventoryStatus: Stock updated for inventoryId: ${update.inventoryId}`);
    }

    update.status = status;
    await update.save();
    console.log(`updateInventoryStatus: Status updated to: ${status}`);

    const staff = await Guest.findById(update.staffId);
    if (staff) {
      await sendNotification(staff.email, `Your ${update.action} request for Room ${update.roomId} has been ${status}`);
      console.log(`updateInventoryStatus: Notification sent to staff: ${staff.email}`);
    } else {
      console.log(`updateInventoryStatus: Staff not found for ID: ${update.staffId}`);
    }

    console.log(`updateInventoryStatus: Success`);
    res.status(200).json({ success: true, message: "Inventory status updated" });
  } catch (error) {
    console.error(`updateInventoryStatus: Error:`, {
      message: error.message,
      code: error.code,
      stack: error.stack,
    });
    res.status(500).json({ success: false, message: `Server error: ${error.message}` });
  }
};

export const generateInventoryReport = async (req, res) => {
  try {
    console.log(`generateInventoryReport: ${req.method} ${req.originalUrl} - Starting`);
    console.log(`generateInventoryReport: userId: ${req.userId}, role: ${req.userRole}`);
    const { startDate, endDate, roomId, category } = req.query;
    const query = {};

    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }
    if (roomId) {
      query.roomId = roomId;
    }
    if (category) {
      query["inventoryId.category"] = category.toLowerCase();
    }

    console.log(`generateInventoryReport: Query:`, query);
    const updates = await RoomInventory.find(query)
      .populate({
        path: "inventoryId",
        select: "pname category",
      })
      .populate({
        path: "staffId",
        select: "email",
      })
      .sort({ createdAt: -1 });

    console.log(`generateInventoryReport: Updates fetched: ${updates.length}`);
    const report = updates
      .filter((update) => update.inventoryId && update.staffId)
      .map((update) => ({
        roomId: update.roomId,
        itemName: update.inventoryId.pname,
        category: update.inventoryId.category,
        action: update.action,
        quantity: update.quantity,
        replacementReason: update.replacementReason || "-",
        status: update.status,
        staffEmail: update.staffId.email,
        createdAt: update.createdAt,
      }));

    console.log(`generateInventoryReport: Success`);
    res.status(200).json({ success: true, report });
  } catch (error) {
    console.error(`generateInventoryReport: Error:`, {
      message: error.message,
      code: error.code,
      stack: error.stack,
    });
    res.status(500).json({ success: false, message: `Server error: ${error.message}` });
  }
};