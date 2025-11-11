const cron = require('node-cron');
const { generateImmunizationReminders } = require('../controllers/notificationController');

// Schedule notification generation to run daily at 8 AM
const scheduleNotifications = () => {
  // Run every day at 8:00 AM
  cron.schedule('0 8 * * *', async () => {
    console.log('Running scheduled notification generation...');
    try {
      await generateImmunizationReminders();
      console.log('Notification generation completed successfully');
    } catch (error) {
      console.error('Error in scheduled notification generation:', error);
    }
  });

  console.log('Notification scheduler initialized - will run daily at 8:00 AM');
};

module.exports = { scheduleNotifications };