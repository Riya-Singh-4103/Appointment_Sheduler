import { ocrService } from '../services/ocrService.js';
import { geminiService } from '../services/geminiService.js';
import { normalizer } from '../services/normalizer.js';
import { appointmentBuilder } from '../services/appointmentBuilder.js';
import Appointment from '../models/Appointment.js';

// Schedule appointment from text input
export const scheduleFromText = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        status: 'needs_clarification',
        message: 'Text input is required'
      });
    }

    console.log(`Processing text request: ${text}`);

    // Step 1: OCR/Text Processing (direct text input)
    const ocrResult = {
      raw_text: text,
      confidence: 1.0
    };

    // Step 2: AI-Powered Entity Extraction using Gemini
    const entityResult = await geminiService.parseAppointmentRequest(text);

    // Check for guardrails
    if (entityResult.status === 'needs_clarification') {
      return res.status(400).json(entityResult);
    }

    // Step 3: Normalization
    const normalizedResult = normalizer.normalizeDatetime(
      entityResult.entities.date_phrase,
      entityResult.entities.time_phrase
    );

    if (normalizedResult.status === 'needs_clarification') {
      return res.status(400).json(normalizedResult);
    }

    // Step 4: Final Appointment JSON
    const finalResult = appointmentBuilder.buildAppointment(
      entityResult.entities,
      normalizedResult.normalized
    );

    // Save to database
    const appointment = new Appointment({
      department: finalResult.appointment.department,
      date: finalResult.appointment.date,
      time: finalResult.appointment.time,
      timezone: finalResult.appointment.tz,
      status: finalResult.status,
      originalText: text,
      processingMetadata: {
        ocrConfidence: ocrResult.confidence,
        entitiesConfidence: entityResult.entities_confidence,
        normalizationConfidence: normalizedResult.normalization_confidence,
        geminiResponse: entityResult.gemini_response
      }
    });

    await appointment.save();

    res.json(finalResult);

  } catch (error) {
    console.error('Error processing text request:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Schedule appointment from image input
export const scheduleFromImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'needs_clarification',
        message: 'Image file is required'
      });
    }

    console.log(`Processing image request: ${req.file.originalname}`);

    // Step 1: OCR Processing
    const ocrResult = await ocrService.extractTextFromImage(req.file.buffer);

    if (ocrResult.confidence < 0.5) {
      return res.status(400).json({
        status: 'needs_clarification',
        message: 'OCR confidence too low. Please provide clearer image or type the request.'
      });
    }

    // Continue with text processing using extracted text
    const text = ocrResult.raw_text;
    
    // Step 2: AI-Powered Entity Extraction using Gemini
    const entityResult = await geminiService.parseAppointmentRequest(text);

    if (entityResult.status === 'needs_clarification') {
      return res.status(400).json(entityResult);
    }

    // Step 3: Normalization
    const normalizedResult = normalizer.normalizeDatetime(
      entityResult.entities.date_phrase,
      entityResult.entities.time_phrase
    );

    if (normalizedResult.status === 'needs_clarification') {
      return res.status(400).json(normalizedResult);
    }

    // Step 4: Final Appointment JSON
    const finalResult = appointmentBuilder.buildAppointment(
      entityResult.entities,
      normalizedResult.normalized
    );

    // Save to database
    const appointment = new Appointment({
      department: finalResult.appointment.department,
      date: finalResult.appointment.date,
      time: finalResult.appointment.time,
      timezone: finalResult.appointment.tz,
      status: finalResult.status,
      originalText: text,
      processingMetadata: {
        ocrConfidence: ocrResult.confidence,
        entitiesConfidence: entityResult.entities_confidence,
        normalizationConfidence: normalizedResult.normalization_confidence,
        geminiResponse: entityResult.gemini_response
      }
    });

    await appointment.save();

    res.json(finalResult);

  } catch (error) {
    console.error('Error processing image request:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};