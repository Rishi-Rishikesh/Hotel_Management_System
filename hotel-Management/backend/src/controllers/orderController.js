import mongoose from 'mongoose';
import Order from '../models/orderModel.js';
import Notification from '../models/notificationModel.js';
import Guest from '../models/guestModel.js';
import AdminNotification from '../models/adminNotificationModel.js';

export const getOrders = async (req, res) => {
  try {
    if (!req.user || !req.user.mongoId) {
      console.log(`getOrders: ${req.method} ${req.originalUrl} - Missing req.user or mongoId`);
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }
    const userId = req.user.mongoId;
    console.log(`getOrders: ${req.method} ${req.originalUrl} - Fetching orders for userId: ${userId}`);
    
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.log(`getOrders: ${req.method} ${req.originalUrl} - Invalid userId: ${userId}`);
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }
    
    const orders = await Order.find({ userId }).sort({ createdAt: -1 });
    console.log(`getOrders: ${req.method} ${req.originalUrl} - Response: ${orders.length} orders found`);
    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error(`getOrders: ${req.method} ${req.originalUrl} - Error:`, {
      message: error.message,
      stack: error.stack,
      userId: req.user?.mongoId,
    });
    res.status(500).json({ success: false, message: `Server error: ${error.message}` });
  }
};

export const createOrder = async (req, res) => {
  try {
    if (!req.user || !req.user.mongoId) {
      console.log(`createOrder: ${req.method} ${req.originalUrl} - Missing req.user or mongoId`);
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }
    const userId = req.user.mongoId;
    const { items, totalPrice, deliveryTime } = req.body;
    
    console.log(`createOrder: ${req.method} ${req.originalUrl} - Creating order for userId: ${userId}`);
    
    if (!items?.length || !totalPrice || !deliveryTime) {
      console.log(`createOrder: ${req.method} ${req.originalUrl} - Missing required fields`);
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.log(`createOrder: ${req.method} ${req.originalUrl} - Invalid userId: ${userId}`);
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }
    
    const order = new Order({
      userId,
      items,
      totalPrice,
      deliveryTime,
      status: 'Pending',
    });
    
    await order.save();
    console.log(`createOrder: ${req.method} ${req.originalUrl} - Order created: ${order._id}`);
    
    try {
      const notification = new Notification({
        userId,
        message: `Order #${order._id.toString().slice(-6).toUpperCase()} placed successfully! Total: LKR ${totalPrice.toFixed(0)}, Delivery: ${deliveryTime}`,
        type: 'OrderPlaced',
      });
      await notification.save();
      console.log(`createOrder: ${req.method} ${req.originalUrl} - Notification created: ${notification._id}`);
    } catch (notificationError) {
      console.error(`createOrder: ${req.method} ${req.originalUrl} - Failed to create notification:`, {
        message: notificationError.message,
        stack: notificationError.stack,
      });
    }
    
    res.status(201).json({ success: true, order });
  } catch (error) {
    console.error(`createOrder: ${req.method} ${req.originalUrl} - Error:`, {
      message: error.message,
      stack: error.stack,
      userId: req.user?.mongoId,
    });
    res.status(500).json({ success: false, message: `Server error: ${error.message}` });
  }
};


export const getNotifications = async (req, res) => {
  try {
    if (!req.user || !req.user.mongoId) {
      console.log(`getNotifications: ${req.method} ${req.originalUrl} - Missing req.user or mongoId`);
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }
    const userId = req.user.mongoId;
    console.log(`getNotifications: ${req.method} ${req.originalUrl} - Fetching notifications for userId: ${userId}`);
    
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.log(`getNotifications: ${req.method} ${req.originalUrl} - Invalid userId: ${userId}`);
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }
    
    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });
    console.log(`getNotifications: ${req.method} ${req.originalUrl} - Response: ${notifications.length} notifications found`);
    res.status(200).json({ success: true, notifications });
  } catch (error) {
    console.error(`getNotifications: ${req.method} ${req.originalUrl} - Error:`, {
      message: error.message,
      stack: error.stack,
      userId: req.user?.mongoId,
    });
    res.status(500).json({ success: false, message: `Server error: ${error.message}` });
  }
};

export const markNotificationAsRead = async (req, res) => {
  try {
    if (!req.user || !req.user.mongoId) {
      console.log(`markNotificationAsRead: ${req.method} ${req.originalUrl} - Missing req.user or mongoId`);
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }
    const { notificationId } = req.params;
    const userId = req.user.mongoId;
    console.log(`markNotificationAsRead: ${req.method} ${req.originalUrl} - Marking notification ${notificationId} as read for userId: ${userId}`);

    if (!mongoose.Types.ObjectId.isValid(notificationId) || !mongoose.Types.ObjectId.isValid(userId)) {
      console.log(`markNotificationAsRead: ${req.method} ${req.originalUrl} - Invalid notificationId: ${notificationId} or userId: ${userId}`);
      return res.status(400).json({ success: false, message: 'Invalid notification or user ID' });
    }

    const notification = await Notification.findOne({ _id: notificationId, userId });
    if (!notification) {
      console.log(`markNotificationAsRead: ${req.method} ${req.originalUrl} - Notification not found: ${notificationId}`);
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({ success: true, notification });
  } catch (error) {
    console.error(`markNotificationAsRead: ${req.method} ${req.originalUrl} - Error:`, {
      message: error.message,
      stack: error.stack,
      userId: req.user?.mongoId,
    });
    res.status(500).json({ success: false, message: `Server error: ${error.message}` });
  }
};


export const getAllOrders = async (req, res) => {
  try {
    if (!req.user || !req.user.mongoId) {
      console.log(`getAllOrders: ${req.method} ${req.originalUrl} - Missing req.user or mongoId`);
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }
    const userId = req.user.mongoId;
    console.log(`getAllOrders: ${req.method} ${req.originalUrl} - Fetching all orders for admin userId: ${userId}`);

    if (req.user.role !== 'Admin') {
      console.log(`getAllOrders: ${req.method} ${req.originalUrl} - Unauthorized access by userId: ${userId}`);
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.log(`getAllOrders: ${req.method} ${req.originalUrl} - Invalid userId: ${userId}`);
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }

    const orders = await Order.find({ userId: { $exists: true, $ne: null } })
      .populate({
        path: 'userId',
        select: 'fname lname email',
        match: { _id: { $exists: true } },
      })
      .sort({ createdAt: -1 });

    const validOrders = orders.filter(order => order.userId !== null);

    const invalidOrders = orders.filter(order => order.userId === null);
    if (invalidOrders.length > 0) {
      console.warn(`getAllOrders: ${req.method} ${req.originalUrl} - Found ${invalidOrders.length} orders with invalid or missing userId`, {
        invalidOrderIds: invalidOrders.map(order => order._id),
      });
    }

    console.log(`getAllOrders: ${req.method} ${req.originalUrl} - Response: ${validOrders.length} valid orders found`);
    res.status(200).json({ success: true, orders: validOrders });
  } catch (error) {
    console.error(`getAllOrders: ${req.method} ${req.originalUrl} - Error:`, {
      message: error.message,
      stack: error.stack,
      userId: req.user?.mongoId,
    });
    res.status(500).json({ success: false, message: `Server error: ${error.message}` });
  }
};

export const notifyAdmin = async (req, res) => {
  try {
    if (!req.user || !req.user.mongoId) {
      console.log(`notifyAdmin: ${req.method} ${req.originalUrl} - Missing req.user or mongoId`);
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }
    const userId = req.user.mongoId;
    const { message, type } = req.body;
    console.log(`notifyAdmin: ${req.method} ${req.originalUrl} - Creating admin notification for userId: ${userId}`, { message, type });

    if (!message || !type) {
      console.log(`notifyAdmin: ${req.method} ${req.originalUrl} - Missing message or type`);
      return res.status(400).json({ success: false, message: 'Message and type are required' });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.log(`notifyAdmin: ${req.method} ${req.originalUrl} - Invalid userId: ${userId}`);
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }

    const notification = new AdminNotification({
      userId,
      message,
      type,
    });
    await notification.save();
    console.log(`notifyAdmin: ${req.method} ${req.originalUrl} - Notification created: ${notification._id}`);

    res.status(201).json({ success: true, notification });
  } catch (error) {
    console.error(`notifyAdmin: ${req.method} ${req.originalUrl} - Error:`, {
      message: error.message,
      stack: error.stack,
      userId: req.user?.mongoId,
    });
    res.status(500).json({ success: false, message: `Server error: ${error.message}` });
  }
};


export const updateOrder = async (req, res) => {
  try {
    if (!req.user || !req.user.mongoId) {
      console.log(`updateOrder: ${req.method} ${req.originalUrl} - Missing req.user or mongoId`);
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }
    const { orderId } = req.params;
    const { items, totalPrice, deliveryTime, status } = req.body;
    const userId = req.user.mongoId;
    console.log(`updateOrder: ${req.method} ${req.originalUrl} - Updating order ${orderId} for userId: ${userId}`);

    if (!mongoose.Types.ObjectId.isValid(orderId) || !mongoose.Types.ObjectId.isValid(userId)) {
      console.log(`updateOrder: ${req.method} ${req.originalUrl} - Invalid orderId: ${orderId} or userId: ${userId}`);
      return res.status(400).json({ success: false, message: 'Invalid order or user ID' });
    }

    const order = req.user.role === 'Admin' 
      ? await Order.findById(orderId)
      : await Order.findOne({ _id: orderId, userId });
    if (!order) {
      console.log(`updateOrder: ${req.method} ${req.originalUrl} - Order not found: ${orderId}`);
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.status === 'Delivered' || order.status === 'Cancelled') {
      console.log(`updateOrder: ${req.method} ${req.originalUrl} - Cannot update order with status: ${order.status}`);
      return res.status(400).json({ success: false, message: `Cannot update order with status ${order.status}` });
    }

    // Allow status-only updates for admins
    if (req.user.role === 'Admin' && status && !items && !totalPrice && !deliveryTime) {
      if (!['Pending', 'Delivered'].includes(status)) {
        console.log(`updateOrder: ${req.method} ${req.originalUrl} - Invalid status: ${status}`);
        return res.status(400).json({ success: false, message: 'Status must be Pending or Delivered' });
      }
      order.status = status;
    } else {
      // Validate inputs only if provided
      if (items && (!Array.isArray(items) || items.length === 0)) {
        console.log(`updateOrder: ${req.method} ${req.originalUrl} - Invalid items: ${JSON.stringify(items)}`);
        return res.status(400).json({ success: false, message: 'Items must be a non-empty array' });
      }
      if (totalPrice && (typeof totalPrice !== 'number' || totalPrice <= 0)) {
        console.log(`updateOrder: ${req.method} ${req.originalUrl} - Invalid totalPrice: ${totalPrice}`);
        return res.status(400).json({ success: false, message: 'Valid total price is required' });
      }
      if (deliveryTime && typeof deliveryTime !== 'string') {
        console.log(`updateOrder: ${req.method} ${req.originalUrl} - Invalid deliveryTime: ${deliveryTime}`);
        return res.status(400).json({ success: false, message: 'Delivery time must be a string' });
      }
      if (status && !['Pending', 'Delivered'].includes(status)) {
        console.log(`updateOrder: ${req.method} ${req.originalUrl} - Invalid status: ${status}`);
        return res.status(400).json({ success: false, message: 'Status must be Pending or Delivered' });
      }

      if (items) order.items = items;
      if (totalPrice) order.totalPrice = totalPrice;
      if (deliveryTime) order.deliveryTime = deliveryTime;
      if (status) order.status = status;
    }

    await order.save();

    try {
      let message = `Your order #${order._id.toString().slice(-6).toUpperCase()} has been updated for ${deliveryTime || order.deliveryTime}.`;
      let notificationType = 'OrderUpdated';
      if (status === 'Delivered') {
        message = `Order #${order._id.toString().slice(-6).toUpperCase()} delivered successfully! Total: LKR ${order.totalPrice.toFixed(0)}`;
        notificationType = 'OrderDelivered';
      }
      const notification = new Notification({
        userId: order.userId,
        message,
        type: notificationType,
      });
      await notification.save();
      console.log(`updateOrder: ${req.method} ${req.originalUrl} - Notification created: ${notification._id}`);
    } catch (notificationError) {
      console.error(`updateOrder: ${req.method} ${req.originalUrl} - Failed to create notification:`, {
        message: notificationError.message,
        stack: notificationError.stack,
      });
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error(`updateOrder: ${req.method} ${req.originalUrl} - Error:`, {
      message: error.message,
      stack: error.stack,
      userId: req.user?.mongoId,
    });
    res.status(500).json({ success: false, message: `Server error: ${error.message}` });
  }
};

export const deleteOrder = async (req, res) => {
  try {
    if (!req.user || !req.user.mongoId) {
      console.log(`deleteOrder: ${req.method} ${req.originalUrl} - Missing req.user or mongoId`);
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }
    const { orderId } = req.params;
    const userId = req.user.mongoId;
    console.log(`deleteOrder: ${req.method} ${req.originalUrl} - Deleting order ${orderId} for userId: ${userId}, role: ${req.user.role}`);

    if (!mongoose.Types.ObjectId.isValid(orderId) || !mongoose.Types.ObjectId.isValid(userId)) {
      console.log(`deleteOrder: ${req.method} ${req.originalUrl} - Invalid orderId: ${orderId} or userId: ${userId}`);
      return res.status(400).json({ success: false, message: 'Invalid order or user ID' });
    }

    const order = req.user.role === 'Admin'
      ? await Order.findById(orderId)
      : await Order.findOne({ _id: orderId, userId });
    if (!order) {
      console.log(`deleteOrder: ${req.method} ${req.originalUrl} - Order not found: ${orderId}`);
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    await Order.deleteOne({ _id: orderId });
    console.log(`deleteOrder: ${req.method} ${req.originalUrl} - Order deleted: ${orderId}`);

    try {
      const message = req.user.role === 'Admin'
        ? `Order #${order._id.toString().slice(-6).toUpperCase()} deleted by admin.`
        : `Order #${order._id.toString().slice(-6).toUpperCase()} deleted successfully.`;
      const notification = new Notification({
        userId: order.userId,
        message,
        type: 'OrderDeleted',
      });
      await notification.save();
      console.log(`deleteOrder: ${req.method} ${req.originalUrl} - Notification created: ${notification._id}`);
    } catch (notificationError) {
      console.error(`deleteOrder: ${req.method} ${req.originalUrl} - Failed to create notification:`, {
        message: notificationError.message,
        stack: notificationError.stack,
      });
    }

    res.status(200).json({ success: true, message: 'Order deleted successfully' });
  } catch (error) {
    console.error(`deleteOrder: ${req.method} ${req.originalUrl} - Error:`, {
      message: error.message,
      stack: error.stack,
      userId: req.user?.mongoId,
    });
    res.status(500).json({ success: false, message: `Server error: ${error.message}` });
  }
};



export const cancelOrder = async (req, res) => {
  try {
    if (!req.user || !req.user.mongoId) {
      console.log(`cancelOrder: ${req.method} ${req.originalUrl} - Missing req.user or mongoId`);
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }
    const { orderId } = req.params;
    const userId = req.user.mongoId;
    console.log(`cancelOrder: ${req.method} ${req.originalUrl} - Cancelling order ${orderId} for userId: ${userId}`);

    if (!mongoose.Types.ObjectId.isValid(orderId) || !mongoose.Types.ObjectId.isValid(userId)) {
      console.log(`cancelOrder: ${req.method} ${req.originalUrl} - Invalid orderId: ${orderId} or userId: ${userId}`);
      return res.status(400).json({ success: false, message: 'Invalid order or user ID' });
    }

    const order = req.user.role === 'Admin'
      ? await Order.findById(orderId)
      : await Order.findOne({ _id: orderId, userId });
    if (!order) {
      console.log(`cancelOrder: ${req.method} ${req.originalUrl} - Order not found: ${orderId}`);
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.status === 'Delivered' || order.status === 'Cancelled') {
      console.log(`cancelOrder: ${req.method} ${req.originalUrl} - Cannot cancel order with status: ${order.status}`);
      return res.status(400).json({ success: false, message: `Cannot cancel order with status ${order.status}` });
    }

    order.status = 'Cancelled';
    await order.save();

    try {
      const message = req.user.role === 'Admin'
        ? `Order #${order._id.toString().slice(-6).toUpperCase()} cancelled by admin.`
        : `Order #${order._id.toString().slice(-6).toUpperCase()} cancelled successfully.`;
      const notification = new Notification({
        userId: order.userId,
        message,
        type: 'OrderCancelled',
      });
      await notification.save();
      console.log(`cancelOrder: ${req.method} ${req.originalUrl} - Notification created: ${notification._id}`);
    } catch (notificationError) {
      console.error(`cancelOrder: ${req.method} ${req.originalUrl} - Failed to create notification:`, {
        message: notificationError.message,
        stack: notificationError.stack,
      });
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error(`cancelOrder: ${req.method} ${req.originalUrl} - Error:`, {
      message: error.message,
      stack: error.stack,
      userId: req.user?.mongoId,
    });
    res.status(500).json({ success: false, message: `Server error: ${error.message}` });
  }
};




export const deliverOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    if (!['Pending', 'Confirmed'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be delivered: Must be in Pending or Confirmed status',
      });
    }
    order.status = 'Delivered';
    await order.save();
    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error('deliverOrder Error:', error);
    res.status(400).json({
      success: false,
      errors: error.errors
        ? Object.values(error.errors).map((e) => e.message)
        : [error.message],
    });
  }
};

