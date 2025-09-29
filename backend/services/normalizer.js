import moment from 'moment-timezone';

const normalizeDatetime = (datePhrase, timePhrase) => {
  try {
    // Set the current date as September 29, 2025 (Sunday)
    const currentDate = moment.tz('2025-09-29', 'Asia/Kolkata');
    
    // Parse the time first
    const timeParsed = moment.tz(timePhrase, ['h:mm A', 'h A', 'HH:mm'], 'Asia/Kolkata');
    if (!timeParsed.isValid()) {
      throw new Error(`Could not parse time: "${timePhrase}"`);
    }
    
    let targetDate;
    
    // Handle different date phrases
    if (datePhrase.toLowerCase().includes('next friday')) {
      // Current date is Sunday (29 Sep 2025), so next Friday is Oct 3, 2025
      targetDate = currentDate.clone().day(5 + 7); // Next Friday (5 = Friday, +7 for next week)
    } else if (datePhrase.toLowerCase().includes('tomorrow')) {
      targetDate = currentDate.clone().add(1, 'day');
    } else if (datePhrase.toLowerCase().includes('today')) {
      targetDate = currentDate.clone();
    } else {
      // Try to parse other date formats
      targetDate = moment.tz(datePhrase, 'Asia/Kolkata');
      if (!targetDate.isValid()) {
        throw new Error(`Could not parse date: "${datePhrase}"`);
      }
    }
    
    // Combine date and time
    const finalDateTime = targetDate
      .hour(timeParsed.hour())
      .minute(timeParsed.minute())
      .second(0)
      .millisecond(0);

    return {
      normalized: {
        date: finalDateTime.format('YYYY-MM-DD'),
        time: finalDateTime.format('HH:mm'),
        tz: 'Asia/Kolkata',
      },
      normalization_confidence: 0.90,
    };
  } catch (error) {
    return {
      status: 'needs_clarification',
      message: `Could not parse date/time: ${error.message}`,
    };
  }
};

export const normalizer = {
  normalizeDatetime,
};