import express from 'express';
import { body, param } from 'express-validator';
import { getOrders, createOrder, updateOrder, cancelOrder, deleteOrder, getNotifications, markNotificationAsRead, getAllOrders, notifyAdmin } from '../controllers/orderController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { validationResult } from 'express-validator';

const router = express.Router();

// Validation for order updates, relaxed for admin status updates
const validateOrder = [
  body('items').optional().isArray().notEmpty().withMessage('Items must be a non-empty array'),
  body('totalPrice').optional().isFloat({ min: 0 }).withMessage('Total price must be a positive number'),
  body('deliveryTime').optional().isString().notEmpty().withMessage('Delivery time must be a string'),
  body('status').optional().isIn(['Pending', 'Delivered']).withMessage('Status must be Pending or Delivered'),
];

const validateOrderId = [
  param('orderId').isMongoId().withMessage('Invalid order ID'),
];

const validateNotificationId = [
  param('notificationId').isMongoId().withMessage('Invalid notification ID'),
];

const handleValidationErrors = (req, res, next) => {
  // Skip validation for admins updating only status
  if (req.user?.role === 'Admin' && req.body.status && Object.keys(req.body).length === 1) {
    return next();
  }
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(`Validation errors for ${req.method} ${req.originalUrl}:`, errors.array());
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

router.use((req, res, next) => {
  console.log(`Order route hit: ${req.method} ${req.originalUrl}`);
  next();
});

router.get('/', authMiddleware(['User', 'Admin']), getOrders);
router.post('/', authMiddleware(['User']), validateOrder, handleValidationErrors, createOrder);
router.put('/:orderId', authMiddleware(['User', 'Admin']), [...validateOrderId, ...validateOrder], handleValidationErrors, updateOrder);
router.delete('/:orderId/cancel', authMiddleware(['User', 'Admin']), validateOrderId, handleValidationErrors, cancelOrder);
router.delete('/:orderId', authMiddleware(['User', 'Admin']), validateOrderId, handleValidationErrors, deleteOrder);
router.get('/notifications', authMiddleware(['User', 'Admin']), getNotifications);
router.patch('/notifications/:notificationId', authMiddleware(['User', 'Admin']), validateNotificationId, handleValidationErrors, markNotificationAsRead);
router.get('/all', authMiddleware(['Admin']), getAllOrders);
router.post('/admin/notify', authMiddleware(['Admin']), notifyAdmin);

export default router;