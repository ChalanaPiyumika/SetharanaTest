/**
 * Consultation Status Enum
 * Represents the lifecycle state of a video consultation
 */

const ConsultationStatus = {
    SCHEDULED: 'SCHEDULED', // Created, not yet started
    ACTIVE: 'ACTIVE',       // Doctor has started the session
    ENDED: 'ENDED'          // Session has been ended
};

module.exports = { ConsultationStatus };
