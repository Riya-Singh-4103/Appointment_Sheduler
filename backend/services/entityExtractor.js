import nlp from 'compromise';
import dates from 'compromise-dates'; // <-- Import the plugin
import { DEPARTMENT_MAPPINGS } from '../utils/constants.js';

nlp.extend(dates); // <-- Extend compromise with the dates plugin

const extractEntities = (text) => {
  const doc = nlp(text);

  // Extract department
  const departmentKeywords = Object.keys(DEPARTMENT_MAPPINGS);
  const department = doc.lookup(departmentKeywords).first().text();

  // Extract date and time phrases
  const datePhrase = doc.dates().first().text();
  const timePhrase = doc.match('#Time').first().text();

  // Guardrail check
  if (!department || !datePhrase || !timePhrase) {
    const missing = [!department && 'department', !datePhrase && 'date', !timePhrase && 'time'].filter(Boolean);
    return {
      status: 'needs_clarification',
      message: `Ambiguous or missing: ${missing.join(', ')}`,
    };
  }

  const confidence = (!!department + !!datePhrase + !!timePhrase) / 3;

  return {
    entities: {
      date_phrase: datePhrase,
      time_phrase: timePhrase,
      department: department,
    },
    entities_confidence: parseFloat(confidence.toFixed(2)),
  };
};

export const entityExtractor = {
  extractEntities,
};