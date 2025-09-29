import express from 'express';
import {
  scheduleFromText,
  scheduleFromImage,
} from '../controllers/appointmentController.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.post('/text', scheduleFromText);
router.post('/image', upload.single('file'), scheduleFromImage);

export default router;