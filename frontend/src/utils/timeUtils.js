export const convertToAmPm = (hour) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const adjustedHour = hour % 12 || 12;
    return `${adjustedHour}:00 ${period}`;
  };

export const optimalTimeConverter = (hour, minute) => {
  const period = hour >= 12 ? 'PM' : 'AM';
  const adjustedHour = hour % 12 || 12;
  if (minute == '0') {minute = '00'};
  return `${adjustedHour}:${minute} ${period}`;
};