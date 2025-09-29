import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  department: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  timezone: {
    type: String,
    default: 'Asia/Kolkata',
  },
  status: {
    type: String,
    enum: ['ok', 'needs_clarification'],
    default: 'ok',
  },
  originalText: {
    type: String,
    required: true,
  },
  processingMetadata: {
    ocrConfidence: Number,
    entitiesConfidence: Number,
    normalizationConfidence: Number,
    geminiResponse: mongoose.Schema.Types.Mixed, // Add this field
  },
}, {
  timestamps: true,
});

const Appointment = mongoose.model('Appointment', appointmentSchema);
export default Appointment;