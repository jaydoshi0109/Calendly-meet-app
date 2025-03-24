import express from 'express';
import {
  getAvailability,
  setAvailability,
  getMeetingAvailability
} from '../controllers/availabilityController.js';

import { ensureAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', ensureAuth, getAvailability);
router.post('/', ensureAuth, setAvailability);

// Public route for guests
router.get('/:meetingId', getMeetingAvailability);

export default router;
