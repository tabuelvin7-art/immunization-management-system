const Notification = require('../models/Notification');
const Patient = require('../models/Patient');
const Immunization = require('../models/Immunization');

// Get notifications for current user
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .populate('patient', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: notifications.length, data: notifications });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.status(200).json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user.id, isRead: false },
      { isRead: true }
    );

    res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get unread notification count
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({ 
      user: req.user.id, 
      isRead: false 
    });

    res.status(200).json({ success: true, count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create notification (internal function)
exports.createNotification = async (userId, type, title, message, patientId = null, dueDate = null, priority = 'medium') => {
  try {
    const notification = await Notification.create({
      user: userId,
      patient: patientId,
      type,
      title,
      message,
      dueDate,
      priority
    });
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

// Generate immunization reminders (scheduled job function)
exports.generateImmunizationReminders = async () => {
  try {
    const today = new Date();
    const reminderDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

    // Find upcoming immunizations
    const upcomingImmunizations = await Immunization.find({
      nextDueDate: { $gte: today, $lte: reminderDate },
      status: 'Due'
    }).populate('patient');

    for (const imm of upcomingImmunizations) {
      if (imm.patient.parentUser) {
        await exports.createNotification(
          imm.patient.parentUser,
          'upcoming_immunization',
          'Upcoming Immunization',
          `${imm.patient.name} has an upcoming ${imm.vaccineName} immunization due on ${new Date(imm.nextDueDate).toLocaleDateString()}`,
          imm.patient._id,
          imm.nextDueDate,
          'high'
        );
      }
    }

    // Find overdue immunizations
    const overdueImmunizations = await Immunization.find({
      nextDueDate: { $lt: today },
      status: 'Overdue'
    }).populate('patient');

    for (const imm of overdueImmunizations) {
      if (imm.patient.parentUser) {
        await exports.createNotification(
          imm.patient.parentUser,
          'overdue_immunization',
          'Overdue Immunization',
          `${imm.patient.name} has an overdue ${imm.vaccineName} immunization that was due on ${new Date(imm.nextDueDate).toLocaleDateString()}`,
          imm.patient._id,
          imm.nextDueDate,
          'high'
        );
      }
    }

    console.log('Immunization reminders generated successfully');
  } catch (error) {
    console.error('Error generating immunization reminders:', error);
  }
};