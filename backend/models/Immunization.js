const mongoose = require('mongoose');

const immunizationSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  vaccineName: {
    type: String,
    required: [true, 'Vaccine name is required'],
    trim: true
  },
  dateAdministered: {
    type: Date,
    required: [true, 'Date administered is required']
  },
  batchNumber: {
    type: String,
    required: [true, 'Batch number is required'],
    trim: true
  },
  nextDueDate: {
    type: Date
  },
  administeredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  notes: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['Completed', 'Due', 'Overdue'],
    default: 'Completed'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Immunization', immunizationSchema);
