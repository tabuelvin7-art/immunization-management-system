const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');

// Create appointment request
exports.createAppointment = async (req, res) => {
  try {
    const { patientId, vaccineName, immunizationId, preferredDate, notes } = req.body;

    // Verify the patient belongs to the parent
    const patient = await Patient.findOne({
      _id: patientId,
      parentUser: req.user.id
    });

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found or access denied' });
    }

    const appointment = await Appointment.create({
      patient: patientId,
      parentUser: req.user.id,
      vaccineName,
      immunizationId,
      preferredDate,
      notes
    });

    // Create notification for clinic staff
    try {
      const User = require('../models/User');
      const { createNotification } = require('./notificationController');
      
      // Get all doctors and nurses
      const staffUsers = await User.find({ role: { $in: ['Doctor', 'Nurse'] } });
      
      // Create notification for each staff member
      for (const staff of staffUsers) {
        await createNotification(
          staff._id,
          'appointment_reminder',
          'New Appointment Request',
          `${patient.name} has requested an appointment for ${vaccineName} on ${new Date(preferredDate).toLocaleDateString()}`,
          patientId,
          appointment._id,
          'high'
        );
      }
    } catch (notificationError) {
      console.log('Notification creation failed:', notificationError.message);
    }

    res.status(201).json({ 
      success: true, 
      message: 'Appointment request submitted successfully. The clinic will contact you to confirm.',
      data: appointment 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get parent's appointments
exports.getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ parentUser: req.user.id })
      .populate('patient', 'name dateOfBirth')
      .sort({ preferredDate: 1 });

    res.status(200).json({ success: true, count: appointments.length, data: appointments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cancel appointment
exports.cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      parentUser: req.user.id
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    appointment.status = 'Cancelled';
    await appointment.save();

    res.status(200).json({ success: true, message: 'Appointment cancelled', data: appointment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Get all appointments (for staff)
exports.getAllAppointments = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};

    const appointments = await Appointment.find(filter)
      .populate('patient', 'name dateOfBirth gender contactNumber')
      .populate('parentUser', 'name email')
      .sort({ preferredDate: 1 });

    res.status(200).json({ success: true, count: appointments.length, data: appointments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update appointment status (for staff)
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['Pending', 'Confirmed', 'Completed', 'Cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const appointment = await Appointment.findById(req.params.id)
      .populate('patient', 'name')
      .populate('parentUser', 'name');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    appointment.status = status;
    await appointment.save();

    // Notify parent about status change
    try {
      const { createNotification } = require('./notificationController');
      
      let message = '';
      let priority = 'medium';
      
      if (status === 'Confirmed') {
        message = `Your appointment for ${appointment.patient.name}'s ${appointment.vaccineName} vaccination on ${new Date(appointment.preferredDate).toLocaleDateString()} has been confirmed.`;
        priority = 'high';
      } else if (status === 'Cancelled') {
        message = `Your appointment for ${appointment.patient.name}'s ${appointment.vaccineName} vaccination has been cancelled. Please contact the clinic to reschedule.`;
        priority = 'high';
      } else if (status === 'Completed') {
        message = `${appointment.patient.name}'s ${appointment.vaccineName} vaccination appointment has been completed.`;
      }

      if (message) {
        await createNotification(
          appointment.parentUser._id,
          'appointment_reminder',
          `Appointment ${status}`,
          message,
          appointment.patient._id,
          appointment._id,
          priority
        );
      }
    } catch (notificationError) {
      console.log('Notification creation failed:', notificationError.message);
    }

    res.status(200).json({ 
      success: true, 
      message: `Appointment ${status.toLowerCase()}`,
      data: appointment 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
