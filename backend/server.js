const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const { scheduleNotifications } = require('./utils/notificationScheduler');

// Load env vars
dotenv.config();

const app = express();

// Connect to database (async for serverless)
connectDB().catch(err => console.error('Database connection failed:', err));

// Middleware
app.use(cors({
  origin: '*', // Allow all origins for now
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/patients', require('./routes/patientRoutes'));
app.use('/api/immunizations', require('./routes/immunizationRoutes'));
app.use('/api/vaccines', require('./routes/vaccineRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/parent', require('./routes/parentRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));
app.use('/api/staff/appointments', require('./routes/staffAppointmentRoutes'));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Immunization Management System API',
    status: 'running',
    version: '1.0.0'
  });
});

const PORT = process.env.PORT || 5000;

// Only start server if not in Vercel serverless environment
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    
    // Initialize notification scheduler (only in non-serverless environment)
    scheduleNotifications();
  });
}

// Export for Vercel serverless
module.exports = app;
