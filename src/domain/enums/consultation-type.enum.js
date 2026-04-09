/**
 * Consultation Type Enum
 * Represents the type of consultation
 */

const ConsultationType = {
    VIDEO: 1,       // Online video consultation
    IN_PERSON: 2,   // Physical clinic visit
    EMAIL: 3        // Email consultation
};

const ConsultationTypeLabels = {
    1: 'Video Consultation',
    2: 'In-Person Consultation',
    3: 'Email Consultation'
};

const validTypes = Object.values(ConsultationType);

module.exports = {
    ConsultationType,
    ConsultationTypeLabels,
    validTypes
};
