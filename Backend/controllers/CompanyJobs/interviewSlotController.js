const InterviewSlot = require('../../models/CompanyJobs/InterviewSlot');
const Job = require('../../models/CompanyJobs/Job');

// Get all interview slots for a job
const getInterviewSlotsByJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    console.log('Fetching slots for job:', jobId);
    
    // Verify job exists
    const job = await Job.findById(jobId);
    if (!job) {
      console.log('Job not found:', jobId);
      return res.status(404).json({ message: 'Job not found' });
    }
    console.log('Job found:', job.title);

    const slots = await InterviewSlot.find({ jobId })
      .sort({ date: 1, time: 1 });

    console.log('Found slots:', slots.length);
    console.log('Slots data:', slots);

    res.json(slots);
  } catch (error) {
    console.error('Error fetching interview slots:', error);
    res.status(500).json({ message: 'Error fetching interview slots', error: error.message });
  }
};

// Get single interview slot
const getInterviewSlotById = async (req, res) => {
  try {
    const slot = await InterviewSlot.findById(req.params.id)
      .populate('jobId', 'title department');
      // .populate('bookedBy', 'name email'); // TODO: Enable when Student model is created
    
    if (!slot) {
      return res.status(404).json({ message: 'Interview slot not found' });
    }

    res.json(slot);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching interview slot', error: error.message });
  }
};

// Create new interview slot
const createInterviewSlot = async (req, res) => {
  try {
    const { jobId, date, time, duration, type, location, meetingLink, notes } = req.body;
    
    console.log('Creating slot with data:', { jobId, date, time, duration, type });

    // Validate required fields
    if (!jobId || !date || !time) {
      return res.status(400).json({ 
        message: 'Missing required fields: jobId, date, time' 
      });
    }

    // Verify job exists
    const job = await Job.findById(jobId);
    if (!job) {
      console.log('Job not found:', jobId);
      return res.status(404).json({ message: 'Job not found' });
    }
    console.log('Job found:', job.title);

    // Check if slot already exists at this time
    const existingSlot = await InterviewSlot.findOne({ jobId, date, time });
    if (existingSlot) {
      console.log('Duplicate slot found');
      return res.status(400).json({ 
        message: 'Interview slot already exists at this date and time' 
      });
    }

    // Validate date is in the future
    const slotDateTime = new Date(date + 'T' + time);
    const now = new Date();
    console.log('Slot DateTime:', slotDateTime);
    console.log('Current DateTime:', now);
    
    if (slotDateTime <= now) {
      console.log('Date is in the past');
      return res.status(400).json({ 
        message: 'Interview slot must be scheduled for future date and time' 
      });
    }

    const slot = new InterviewSlot({
      jobId,
      date,
      time,
      duration: duration || 30,
      type: type || 'in-person',
      location,
      meetingLink,
      notes
    });

    const savedSlot = await slot.save();
    console.log('Slot saved successfully:', savedSlot._id);
    
    await savedSlot.populate('jobId', 'title department');

    res.status(201).json(savedSlot);
  } catch (error) {
    console.error('Error creating slot:', error);
    if (error.code === 11000) {
      res.status(400).json({ message: 'Interview slot already exists at this date and time' });
    } else {
      res.status(500).json({ message: 'Error creating interview slot', error: error.message });
    }
  }
};

// Update interview slot
const updateInterviewSlot = async (req, res) => {
  try {
    const slot = await InterviewSlot.findById(req.params.id);
    if (!slot) {
      return res.status(404).json({ message: 'Interview slot not found' });
    }

    // Don't allow updating if already booked
    if (slot.isBooked && !req.body.allowBookedUpdate) {
      return res.status(400).json({ 
        message: 'Cannot update booked interview slot' 
      });
    }

    const updatedSlot = await InterviewSlot.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('jobId', 'title department');
     // .populate('bookedBy', 'name email'); // TODO: Enable when Student model is created

    res.json(updatedSlot);
  } catch (error) {
    res.status(500).json({ message: 'Error updating interview slot', error: error.message });
  }
};

// Delete interview slot
const deleteInterviewSlot = async (req, res) => {
  try {
    const slot = await InterviewSlot.findById(req.params.id);
    if (!slot) {
      return res.status(404).json({ message: 'Interview slot not found' });
    }

    // Don't allow deleting if already booked
    if (slot.isBooked) {
      return res.status(400).json({ 
        message: 'Cannot delete booked interview slot' 
      });
    }

    await InterviewSlot.findByIdAndDelete(req.params.id);
    res.json({ message: 'Interview slot deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting interview slot', error: error.message });
  }
};

// Book an interview slot (for students)
const bookInterviewSlot = async (req, res) => {
  try {
    const { studentId } = req.body;
    const slot = await InterviewSlot.findById(req.params.id);
    
    if (!slot) {
      return res.status(404).json({ message: 'Interview slot not found' });
    }

    if (slot.isBooked) {
      return res.status(400).json({ message: 'Interview slot is already booked' });
    }

    // Check if slot is not expired
    const slotDateTime = new Date(slot.date + 'T' + slot.time);
    if (slotDateTime <= new Date()) {
      return res.status(400).json({ message: 'Cannot book expired interview slot' });
    }

    slot.isBooked = true;
    slot.bookedBy = studentId;
    slot.bookedAt = new Date();
    slot.status = 'booked';

    await slot.save();
    await slot.populate('jobId', 'title department');
    // await slot.populate('bookedBy', 'name email'); // TODO: Enable when Student model is created

    res.json(slot);
  } catch (error) {
    res.status(500).json({ message: 'Error booking interview slot', error: error.message });
  }
};

// Cancel booking (for students)
const cancelInterviewSlot = async (req, res) => {
  try {
    const slot = await InterviewSlot.findById(req.params.id);
    
    if (!slot) {
      return res.status(404).json({ message: 'Interview slot not found' });
    }

    if (!slot.isBooked) {
      return res.status(400).json({ message: 'Interview slot is not booked' });
    }

    slot.isBooked = false;
    slot.bookedBy = null;
    slot.bookedAt = null;
    slot.status = 'available';

    await slot.save();
    await slot.populate('jobId', 'title department');

    res.json(slot);
  } catch (error) {
    res.status(500).json({ message: 'Error cancelling interview slot', error: error.message });
  }
};

// Get available slots for a job (for students)
const getAvailableSlots = async (req, res) => {
  try {
    const { jobId } = req.params;
    
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const currentDate = new Date();
    const slots = await InterviewSlot.find({
      jobId,
      isBooked: false,
      $expr: {
        $gt: [
          {
            $dateFromString: {
              dateString: {
                $concat: [
                  { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                  "T",
                  "$time"
                ]
              }
            }
          },
          currentDate
        ]
      }
    }).sort({ date: 1, time: 1 });

    res.json(slots);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching available slots', error: error.message });
  }
};

module.exports = {
  getInterviewSlotsByJob,
  getInterviewSlotById,
  createInterviewSlot,
  updateInterviewSlot,
  deleteInterviewSlot,
  bookInterviewSlot,
  cancelInterviewSlot,
  getAvailableSlots
};