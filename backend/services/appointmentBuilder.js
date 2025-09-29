import { DEPARTMENT_MAPPINGS } from '../utils/constants.js';

const buildAppointment = (entities, normalized) => {
  const departmentKey = entities.department.toLowerCase();
  const departmentName = DEPARTMENT_MAPPINGS[departmentKey] || entities.department;

  return {
    appointment: {
      department: departmentName,
      date: normalized.date,
      time: normalized.time,
      tz: normalized.tz,
    },
    status: 'ok',
  };
};

export const appointmentBuilder = {
  buildAppointment,
};