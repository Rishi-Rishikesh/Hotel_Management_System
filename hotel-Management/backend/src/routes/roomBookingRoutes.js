import express from 'express';
import {
  createRoomBooking,
  getAllRoomBookings,
  getMyRoomBookings,
  getBookings,
  getStaffBookings,
  getRoomBookingById,
  updateRoomBooking,
  deleteRoomBooking,
  approveRoomBooking,
  rejectRoomBooking,
  checkoutRoomBooking,
} from '../controllers/roomBookingController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', authMiddleware(['User', 'Admin']), createRoomBooking);
router.get('/', authMiddleware(['Admin']), getAllRoomBookings);
router.get('/my-bookings', authMiddleware(['User', 'Admin']), getMyRoomBookings);
router.get('/current', authMiddleware(['User', 'Admin']), getBookings);
router.get('/staff', authMiddleware(['Staff', 'Admin']), getStaffBookings);
router.put('/:id', authMiddleware(['User', 'Admin']), updateRoomBooking);
router.delete('/:id', authMiddleware(['User', 'Admin']), deleteRoomBooking);
router.post('/:id/approve', authMiddleware(['Admin']), approveRoomBooking);
router.get('/:id', authMiddleware(['User', 'Admin']), getRoomBookingById);
router.post('/:id/reject', authMiddleware(['Admin']), rejectRoomBooking);
router.post('/:id/checkout', authMiddleware(['Admin']), checkoutRoomBooking);

export default router;