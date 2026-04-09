/**
 * Gender Enumeration
 * Defines the available gender options in the system
 */

const Gender = {
    MALE: 1,
    FEMALE: 2,
    OTHER: 3
};

// Array of valid gender values for validation
const validGenders = Object.values(Gender);

// Gender labels for display
const GenderLabels = {
    [Gender.MALE]: 'Male',
    [Gender.FEMALE]: 'Female',
    [Gender.OTHER]: 'Other'
};

module.exports = {
    Gender,
    validGenders,
    GenderLabels
};
