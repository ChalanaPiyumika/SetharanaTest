/**
 * User Role Enumeration
 * Defines the available user roles in the system
 */

const UserRole = {
    PATIENT: 'PATIENT',
    DOCTOR: 'DOCTOR',
    ADMIN: 'ADMIN'
};

// Array of valid roles for validation
const validRoles = Object.values(UserRole);

module.exports = {
    UserRole,
    validRoles
};
