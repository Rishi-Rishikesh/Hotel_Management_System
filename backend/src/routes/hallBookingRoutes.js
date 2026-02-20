import express from 'express';
import {
  createHallBooking,
  getAllHallBookings,
  getHallBookingById,
  getHallBookingsByHallId,
  getMyHallBookings,
  updateHallBooking,
  deleteHallBooking,
  approveHallBooking,
  rejectHallBooking,
  // getAvailableHalls
} from '../controllers/hallBookingController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', authMiddleware(['User', 'Admin']), createHallBooking);
router.get('/', authMiddleware(['Admin']), getAllHallBookings);
router.get('/my', authMiddleware(['User', 'Admin']), getMyHallBookings);
router.get('/:id', authMiddleware(['User', 'Admin']), getHallBookingById);
router.get('/hall/:hallId', authMiddleware(['User', 'Admin']), getHallBookingsByHallId);
router.put('/:id', authMiddleware(['User', 'Admin']), updateHallBooking);
router.delete('/:id', authMiddleware(['User', 'Admin']), deleteHallBooking);
router.post('/:id/approve', authMiddleware(['Admin']), approveHallBooking);
router.post('/:id/reject', authMiddleware(['Admin']), rejectHallBooking);
// router.get('/available', authMiddleware(['User', 'Admin']), getAvailableHalls);
export default router;