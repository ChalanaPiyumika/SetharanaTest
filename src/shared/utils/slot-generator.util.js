/**
 * Slot Generator Utility
 * Generates appointment slots based on doctor availability
 */

/**
 * Parse time slots from a time range
 * @param {string} startTime - Start time (HH:MM)
 * @param {string} endTime - End time (HH:MM)
 * @param {number} duration - Slot duration in minutes
 * @returns {Array} Array of time slot objects
 */
const parseTimeSlots = (startTime, endTime, duration) => {
    const slots = [];

    // Convert time strings to minutes
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);

    let currentMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    while (currentMinutes + duration <= endMinutes) {
        const slotStartHour = Math.floor(currentMinutes / 60);
        const slotStartMin = currentMinutes % 60;

        const slotEndMinutes = currentMinutes + duration;
        const slotEndHour = Math.floor(slotEndMinutes / 60);
        const slotEndMin = slotEndMinutes % 60;

        const slotStart = `${String(slotStartHour).padStart(2, '0')}:${String(slotStartMin).padStart(2, '0')}`;
        const slotEnd = `${String(slotEndHour).padStart(2, '0')}:${String(slotEndMin).padStart(2, '0')}`;

        slots.push({
            startTime: slotStart,
            endTime: slotEnd
        });

        currentMinutes += duration;
    }

    return slots;
};

/**
 * Generate slots for next N days based on availability
 * @param {Array} availabilitySchedule - Doctor's weekly availability
 * @param {number} daysAhead - Number of days to generate (default: 14)
 * @returns {Array} Array of slot objects with date and time
 */
const generateSlotsForDays = (availabilitySchedule, daysAhead = 14) => {
    const slots = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 1; i <= daysAhead; i++) {
        const currentDate = new Date(today);
        currentDate.setDate(today.getDate() + i);

        const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 1 = Monday, etc.

        // Find availability for this day of week
        const dayAvailability = availabilitySchedule.filter(
            avail => avail.dayOfWeek === dayOfWeek && !avail.deletedAt
        );

        // Generate slots for each availability window
        dayAvailability.forEach(avail => {
            const timeSlots = parseTimeSlots(
                avail.startTime,
                avail.endTime,
                avail.slotDuration
            );

            timeSlots.forEach(slot => {
                slots.push({
                    doctorId: avail.doctorId,
                    slotDate: currentDate.toISOString().split('T')[0], // YYYY-MM-DD
                    startTime: slot.startTime,
                    endTime: slot.endTime,
                    isBooked: false
                });
            });
        });
    }

    return slots;
};

/**
 * Check if a slot time has passed
 * @param {string} slotDate - Slot date (YYYY-MM-DD)
 * @param {string} slotTime - Slot time (HH:MM)
 * @returns {boolean} True if slot is in the past
 */
const isSlotPast = (slotDate, slotTime) => {
    const [hours, minutes] = slotTime.split(':').map(Number);
    const slotDateTime = new Date(slotDate);
    slotDateTime.setHours(hours, minutes, 0, 0);

    return slotDateTime < new Date();
};

/**
 * Generate slots for a specific date
 * @param {number} doctorId - Doctor ID
 * @param {string} date - Date (YYYY-MM-DD)
 * @param {string} startTime - Day start time (HH:MM)
 * @param {string} endTime - Day end time (HH:MM)
 * @param {number} duration - Slot duration in minutes
 * @returns {Array} Array of slot objects
 */
const generateSlotsForDate = (doctorId, date, startTime, endTime, duration) => {
    const timeSlots = parseTimeSlots(startTime, endTime, duration);
    
    return timeSlots.map(slot => ({
        doctorId,
        slotDate: date,
        startTime: slot.startTime,
        endTime: slot.endTime,
        isBooked: false
    }));
};

module.exports = {
    parseTimeSlots,
    generateSlotsForDays,
    generateSlotsForDate,
    isSlotPast
};
