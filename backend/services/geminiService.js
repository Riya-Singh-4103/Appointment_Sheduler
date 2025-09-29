import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const parseAppointmentRequest = async (text) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    const prompt = `
    You are an AI assistant that extracts appointment information from natural language text.
    
    Extract the following information from this appointment request: "${text}"
    
    Return ONLY a JSON object with this exact structure:
    {
      "department": "extracted department/doctor type (e.g., dentist, cardiologist, doctor)",
      "date_phrase": "extracted date phrase (e.g., next Friday, tomorrow, today)",
      "time_phrase": "extracted time phrase (e.g., 3pm, 10:30am, 15:00)",
      "confidence": 0.85
    }
    
    Rules:
    - If any field is missing or unclear, set it to null
    - Department should be the basic keyword (dentist, not Dentistry)
    - Keep original phrasing for date_phrase and time_phrase
    - Confidence should be between 0.0 and 1.0
    - Return ONLY valid JSON, no explanations
    
    Examples:
    Input: "Book dentist next Friday at 3pm"
    Output: {"department": "dentist", "date_phrase": "next Friday", "time_phrase": "3pm", "confidence": 0.95}
    
    Input: "I need to see a heart doctor tomorrow at 10:30am"
    Output: {"department": "heart", "date_phrase": "tomorrow", "time_phrase": "10:30am", "confidence": 0.90}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();
    
    console.log(`Gemini Raw Response: ${responseText}`);
    
    // Clean the response to ensure it's valid JSON
    const cleanedText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    
    // Parse the JSON response
    const parsedResult = JSON.parse(cleanedText);
    
    // Validate the structure
    if (!parsedResult || typeof parsedResult !== 'object') {
      throw new Error('Invalid response structure from Gemini');
    }
    
    // Check for missing critical information
    const missingFields = [];
    if (!parsedResult.department) missingFields.push('department');
    if (!parsedResult.date_phrase) missingFields.push('date');
    if (!parsedResult.time_phrase) missingFields.push('time');
    
    if (missingFields.length > 0) {
      return {
        status: 'needs_clarification',
        message: `Ambiguous or missing: ${missingFields.join(', ')}`,
        gemini_response: parsedResult
      };
    }
    
    return {
      entities: {
        department: parsedResult.department,
        date_phrase: parsedResult.date_phrase,
        time_phrase: parsedResult.time_phrase
      },
      entities_confidence: parsedResult.confidence || 0.85,
      gemini_response: parsedResult
    };
    
  } catch (error) {
    console.error('Gemini API error:', error);
    return {
      status: 'needs_clarification',
      message: `Failed to parse request with AI: ${error.message}`
    };
  }
};

export const geminiService = {
  parseAppointmentRequest,
};