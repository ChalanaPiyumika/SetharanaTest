/**
 * Appointment Status Enum
 * Represents the lifecycle states of an appointment
 */

const AppointmentStatus = {
    SCHEDULED: 1,   // Appointment created, payment pending
    CONFIRMED: 2,   // Payment received, slot locked
    COMPLETED: 3,   // Consultation finished
    CANCELLED: 4    // Cancelled by patient or doctor
};

const AppointmentStatusLabels = {
    1: 'Scheduled',
    2: 'Confirmed',
    3: 'Completed',
    4: 'Cancelled'
};

const validStatuses = Object.values(AppointmentStatus);

module.exports = {
    AppointmentStatus,
    AppointmentStatusLabels,
    validStatuses
};
