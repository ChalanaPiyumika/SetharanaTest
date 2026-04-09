const sequelize = require('./sequelize');
const UserModel = require('../../domain/models/user.model');
const PatientModel = require('../../domain/models/patient.model');
const DoctorModel = require('../../domain/models/doctor.model');
const AppointmentSlotModel = require('../../domain/models/appointment-slot.model');
const AppointmentModel = require('../../domain/models/appointment.model');
const PaymentModel = require('../../domain/models/payment.model');
const ConsultationModel = require('../../domain/models/consultation.model');
const ConsultationDocumentModel = require('../../domain/models/consultation-document.model');
const ConsultationMessageModel = require('../../domain/models/consultation-message.model');
const ContactMessageModel = require('../../domain/models/contact-message.model');
const SpecializationModel = require('../../domain/models/specialization.model');
const DoctorSpecializationModel = require('../../domain/models/doctor-specialization.model');
const DoctorReviewModel = require('../../domain/models/doctor-review.model');
/**
 * Database Initialization
 * Initializes models and database connection
 */

const User = UserModel(sequelize);
const Patient = PatientModel(sequelize);
const Doctor = DoctorModel(sequelize);
const AppointmentSlot = AppointmentSlotModel(sequelize);
const Appointment = AppointmentModel(sequelize);
const Payment = PaymentModel(sequelize);
const Consultation = ConsultationModel(sequelize);
const ConsultationDocument = ConsultationDocumentModel(sequelize);
const ConsultationMessage = ConsultationMessageModel(sequelize);
const ContactMessage = ContactMessageModel(sequelize);
const Specialization = SpecializationModel(sequelize);
const DoctorSpecialization = DoctorSpecializationModel(sequelize);
const DoctorReview = DoctorReviewModel(sequelize);
// Define relationships

// User <-> Patient (One-to-One)
User.hasOne(Patient, {
    foreignKey: 'userId',
    as: 'patientProfile',
    onDelete: 'CASCADE'
});

Patient.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
});

// User <-> Doctor (One-to-One)
User.hasOne(Doctor, {
    foreignKey: 'userId',
    as: 'doctorProfile',
    onDelete: 'CASCADE'
});

Doctor.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
});

// Doctor <-> AppointmentSlot (One-to-Many)
Doctor.hasMany(AppointmentSlot, {
    foreignKey: 'doctorId',
    as: 'slots',
    onDelete: 'CASCADE'
});

AppointmentSlot.belongsTo(Doctor, {
    foreignKey: 'doctorId',
    as: 'doctor'
});

// Patient <-> Appointment (One-to-Many)
Patient.hasMany(Appointment, {
    foreignKey: 'patientId',
    as: 'appointments',
    onDelete: 'CASCADE'
});

Appointment.belongsTo(Patient, {
    foreignKey: 'patientId',
    as: 'patient'
});

// Doctor <-> Appointment (One-to-Many)
Doctor.hasMany(Appointment, {
    foreignKey: 'doctorId',
    as: 'appointments',
    onDelete: 'CASCADE'
});

Appointment.belongsTo(Doctor, {
    foreignKey: 'doctorId',
    as: 'doctor'
});

// AppointmentSlot <-> Appointment (One-to-One)
AppointmentSlot.hasOne(Appointment, {
    foreignKey: 'slotId',
    as: 'appointment',
    onDelete: 'RESTRICT'
});

Appointment.belongsTo(AppointmentSlot, {
    foreignKey: 'slotId',
    as: 'slot'
});

// Appointment <-> Payment (One-to-One)
Appointment.hasOne(Payment, {
    foreignKey: 'appointmentId',
    as: 'payment',
    onDelete: 'CASCADE'
});

Payment.belongsTo(Appointment, {
    foreignKey: 'appointmentId',
    as: 'appointment'
});

// Appointment <-> Consultation (One-to-One)
Appointment.hasOne(Consultation, {
    foreignKey: 'appointmentId',
    as: 'consultation',
    onDelete: 'CASCADE'
});

Consultation.belongsTo(Appointment, {
    foreignKey: 'appointmentId',
    as: 'appointment'
});

// Consultation <-> ConsultationDocument (One-to-Many)
Consultation.hasMany(ConsultationDocument, {
    foreignKey: 'consultationId',
    as: 'documents',
    onDelete: 'CASCADE'
});

ConsultationDocument.belongsTo(Consultation, {
    foreignKey: 'consultationId',
    as: 'consultation'
});

// Consultation <-> ConsultationMessage (One-to-Many)
Consultation.hasMany(ConsultationMessage, {
    foreignKey: 'consultationId',
    as: 'messages',
    onDelete: 'CASCADE'
});

ConsultationMessage.belongsTo(Consultation, {
    foreignKey: 'consultationId',
    as: 'consultation'
});

// Doctor <-> Specialization (Many-to-Many)
Doctor.belongsToMany(Specialization, {
    through: DoctorSpecialization,
    foreignKey: 'doctorId',
    otherKey: 'specializationId',
    as: 'specializations'
});

Specialization.belongsToMany(Doctor, {
    through: DoctorSpecialization,
    foreignKey: 'specializationId',
    otherKey: 'doctorId',
    as: 'doctors'
});

// Doctor <-> DoctorReview (One-to-Many)
Doctor.hasMany(DoctorReview, {
    foreignKey: 'doctorId',
    as: 'reviews',
    onDelete: 'CASCADE'
});

DoctorReview.belongsTo(Doctor, {
    foreignKey: 'doctorId',
    as: 'doctor'
});

// Patient <-> Doctor (Many-to-Many through FavoriteDoctors)
Patient.belongsToMany(Doctor, {
    through: 'FavoriteDoctors',
    foreignKey: 'patientId',
    otherKey: 'doctorId',
    as: 'favoriteDoctors'
});

Doctor.belongsToMany(Patient, {
    through: 'FavoriteDoctors',
    foreignKey: 'doctorId',
    otherKey: 'patientId',
    as: 'favoritedBy'
});

// Export models and sequelize instance
const db = {
    sequelize,
    User,
    Patient,
    Doctor,
    AppointmentSlot,
    Appointment,
    Payment,
    Consultation,
    ConsultationDocument,
    ConsultationMessage,
    ContactMessage,
    Specialization,
    DoctorSpecialization,
    DoctorReview
};

/**
 * Initialize database connection and sync models
 * @returns {Promise<void>}
 */
const initializeDatabase = async () => {
    try {
        // Test connection
        await sequelize.authenticate();
        console.log('✓ Database connection established successfully');

        // Sync models (creates tables if they don't exist)
        await sequelize.sync();
        console.log('✓ Database models synchronized');

    } catch (error) {
        console.error('✗ Unable to connect to the database:', error.message);
        throw error;
    }
};

module.exports = {
    ...db,
    initializeDatabase
};
