const express = require('express');
const router = express.Router();
const {
  getInterviewSlotsByJob,
  getInterviewSlotById,
  createInterviewSlot,
  updateInterviewSlot,
  deleteInterviewSlot,
  bookInterviewSlot,
  cancelInterviewSlot,
  getAvailableSlots
} = require('../../controllers/CompanyJobs/interviewSlotController');

// GET /api/interview-slots/job/:jobId - Get all slots for a job
router.get('/job/:jobId', getInterviewSlotsByJob);

// GET /api/interview-slots/job/:jobId/available - Get available slots for a job
router.get('/job/:jobId/available', getAvailableSlots);

// GET /api/interview-slots/:id - Get single slot
router.get('/:id', getInterviewSlotById);

// POST /api/interview-slots - Create new slot
router.post('/', createInterviewSlot);

// PUT /api/interview-slots/:id - Update slot
router.put('/:id', updateInterviewSlot);

// DELETE /api/interview-slots/:id - Delete slot
router.delete('/:id', deleteInterviewSlot);

// POST /api/interview-slots/:id/book - Book a slot (for students)
router.post('/:id/book', bookInterviewSlot);

// POST /api/interview-slots/:id/cancel - Cancel booking (for students)
router.post('/:id/cancel', cancelInterviewSlot);

module.exports = router;