export const convertToAmPm = (hour) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const adjustedHour = hour % 12 || 12;
    return `${adjustedHour}:00 ${period}`;
  };

export const optimalTimeConverter = (time) => {
  // Split the input time into hours and minutes
  let [hours, minutes] = time.split(":");
  hours = parseInt(hours);

  // Determine the period (AM/PM)
  let period = hours >= 12 ? "PM" : "AM";

  // Convert hours from 24-hour to 12-hour format
  hours = hours % 12 || 12;

  // Return the formatted time
  return `${hours}:${minutes} ${period}`;
};

export const convertAmPmTo24Hour = (time) => {
  const [hour, modifier] = time.split(' '); // Split time into hour and AM/PM part
  let [hours, minutes] = hour.split(':').map(Number);

  if (modifier === 'PM' && hours !== 12) {
    hours += 12;
  }
  if (modifier === 'AM' && hours === 12) {
    hours = 0;
  }
  return hours;
};