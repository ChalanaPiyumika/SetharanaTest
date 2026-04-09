const emailTransporter = require('../../shared/config/email.config');
const {
    appointmentConfirmationTemplate,
    appointmentCancellationTemplate,
    appointmentRescheduleTemplate,
    consultationInviteTemplate,
    genericEmailTemplate
} = require('../../shared/utils/email-templates.util');
const env = require('../../shared/config/env');
const { ConsultationTypeLabels } = require('../../domain/enums/consultation-type.enum');
const path = require('path');

const getLogoAttachment = () => ({
    filename: 'logo.png',
    path: path.join(__dirname, '../../assets/logo.png'),
    cid: 'logo'
});

/**
 * Email Service
 * Handles sending appointment-related emails to BOTH patient and doctor
 */

class EmailService {
    /**
     * Send appointment confirmation email to both patient and doctor
     * @param {object} appointment - Appointment with patient and doctor data
     * @returns {Promise<void>}
     */
    async sendAppointmentConfirmation(appointment) {
        try {
            if (!emailTransporter) {
                console.log('⚠ Email service not configured, skipping confirmation email');
                return;
            }

            const patientName = `${appointment.patient.user.firstName} ${appointment.patient.user.lastName}`;
            const doctorName = `Dr. ${appointment.doctor.user.firstName} ${appointment.doctor.user.lastName}`;
            const patientEmail = appointment.patient.user.email;
            const doctorEmail = appointment.doctor.user.email;

            const emailData = {
                patientName,
                doctorName,
                appointmentDate: appointment.slot.slotDate,
                appointmentTime: `${appointment.slot.startTime} - ${appointment.slot.endTime}`,
                consultationType: ConsultationTypeLabels[appointment.consultationType],
                amount: appointment.amount,
                appointmentId: appointment.publicId
            };

            // Send to patient
            const patientHtml = appointmentConfirmationTemplate(emailData, 'patient');
            await emailTransporter.sendMail({
                from: env.EMAIL_FROM,
                to: patientEmail,
                subject: 'Appointment Confirmed - Ayurveda Consultation',
                html: patientHtml,
                attachments: [getLogoAttachment()]
            });
            console.log(`✓ Confirmation email sent to patient: ${patientEmail}`);

            // Send to doctor
            const doctorHtml = appointmentConfirmationTemplate(emailData, 'doctor');
            await emailTransporter.sendMail({
                from: env.EMAIL_FROM,
                to: doctorEmail,
                subject: 'New Appointment Confirmed - Ayurveda Consultation',
                html: doctorHtml,
                attachments: [getLogoAttachment()]
            });
            console.log(`✓ Confirmation email sent to doctor: ${doctorEmail}`);

        } catch (error) {
            console.error('✗ Failed to send confirmation email:', error.message);
            // Don't throw - email failure shouldn't break the booking flow
        }
    }

    /**
     * Send appointment cancellation email to both patient and doctor
     * @param {object} appointment - Appointment with patient and doctor data
     * @param {number} refundAmount - Refund amount (if applicable)
     * @returns {Promise<void>}
     */
    async sendAppointmentCancellation(appointment, refundAmount = null) {
        try {
            if (!emailTransporter) {
                console.log('⚠ Email service not configured, skipping cancellation email');
                return;
            }

            const patientName = `${appointment.patient.user.firstName} ${appointment.patient.user.lastName}`;
            const doctorName = `Dr. ${appointment.doctor.user.firstName} ${appointment.doctor.user.lastName}`;
            const patientEmail = appointment.patient.user.email;
            const doctorEmail = appointment.doctor.user.email;

            const emailData = {
                patientName,
                doctorName,
                appointmentDate: appointment.slot.slotDate,
                appointmentTime: `${appointment.slot.startTime} - ${appointment.slot.endTime}`,
                appointmentId: appointment.publicId,
                refundAmount
            };

            // Send to patient
            const patientHtml = appointmentCancellationTemplate(emailData, 'patient');
            await emailTransporter.sendMail({
                from: env.EMAIL_FROM,
                to: patientEmail,
                subject: 'Appointment Cancelled - Ayurveda Consultation',
                html: patientHtml,
                attachments: [getLogoAttachment()]
            });
            console.log(`✓ Cancellation email sent to patient: ${patientEmail}`);

            // Send to doctor
            const doctorHtml = appointmentCancellationTemplate(emailData, 'doctor');
            await emailTransporter.sendMail({
                from: env.EMAIL_FROM,
                to: doctorEmail,
                subject: 'Appointment Cancelled - Ayurveda Consultation',
                html: doctorHtml,
                attachments: [getLogoAttachment()]
            });
            console.log(`✓ Cancellation email sent to doctor: ${doctorEmail}`);

        } catch (error) {
            console.error('✗ Failed to send cancellation email:', error.message);
        }
    }

    /**
     * Send appointment reschedule email to both patient and doctor
     * @param {object} appointment - Appointment with patient and doctor data
     * @param {object} oldSlot - Previous slot data
     * @param {object} newSlot - New slot data
     * @returns {Promise<void>}
     */
    async sendAppointmentReschedule(appointment, oldSlot, newSlot) {
        try {
            if (!emailTransporter) {
                console.log('⚠ Email service not configured, skipping reschedule email');
                return;
            }

            const patientName = `${appointment.patient.user.firstName} ${appointment.patient.user.lastName}`;
            const doctorName = `Dr. ${appointment.doctor.user.firstName} ${appointment.doctor.user.lastName}`;
            const patientEmail = appointment.patient.user.email;
            const doctorEmail = appointment.doctor.user.email;

            const emailData = {
                patientName,
                doctorName,
                oldDate: oldSlot.slotDate,
                oldTime: `${oldSlot.startTime} - ${oldSlot.endTime}`,
                newDate: newSlot.slotDate,
                newTime: `${newSlot.startTime} - ${newSlot.endTime}`,
                appointmentId: appointment.publicId
            };

            // Send to patient
            const patientHtml = appointmentRescheduleTemplate(emailData, 'patient');
            await emailTransporter.sendMail({
                from: env.EMAIL_FROM,
                to: patientEmail,
                subject: 'Appointment Rescheduled - Ayurveda Consultation',
                html: patientHtml,
                attachments: [getLogoAttachment()]
            });
            console.log(`✓ Reschedule email sent to patient: ${patientEmail}`);

            // Send to doctor
            const doctorHtml = appointmentRescheduleTemplate(emailData, 'doctor');
            await emailTransporter.sendMail({
                from: env.EMAIL_FROM,
                to: doctorEmail,
                subject: 'Appointment Rescheduled - Ayurveda Consultation',
                html: doctorHtml,
                attachments: [getLogoAttachment()]
            });
            console.log(`✓ Reschedule email sent to doctor: ${doctorEmail}`);

        } catch (error) {
            console.error('✗ Failed to send reschedule email:', error.message);
        }
    }
    /**
     * Send consultation invite email to a user (patient or doctor)
     * @param {object} user        - User with firstName, email
     * @param {object} appointment - Appointment with publicId, slot, and consultationType
     * @param {string} meetingLink - Full consultation page URL
     * @returns {Promise<void>}
     */
    async sendConsultationInvite(user, appointment, meetingLink) {
        try {
            if (!emailTransporter) {
                console.log('⚠ Email service not configured, skipping consultation invite');
                return;
            }

            const slotDate = appointment.slot
                ? new Date(appointment.slot.slotDate).toDateString()
                : 'Scheduled';
            const slotTime = appointment.slot
                ? `${appointment.slot.startTime} - ${appointment.slot.endTime}`
                : '';

            const emailHtml = consultationInviteTemplate({
                firstName: user.firstName,
                appointmentId: appointment.publicId,
                slotDate,
                slotTime,
                meetingLink
            });

            const consultLabel = ConsultationTypeLabels[appointment.consultationType] || 'Consultation';

            await emailTransporter.sendMail({
                from: env.EMAIL_FROM,
                to: user.email,
                subject: `Your ${consultLabel} is Ready — Ayurveda Consultation`,
                html: emailHtml,
                attachments: [getLogoAttachment()]
            });
            console.log(`✓ Consultation invite sent to: ${user.email}`);

        } catch (error) {
            console.error('✗ Failed to send consultation invite:', error.message);
            // Don't throw — email failure shouldn't break the booking flow
        }
    }

    /**
     * Send generic email
     * @param {object} options - Email options
     * @returns {Promise<void>}
     */
    async sendEmail({ to, subject, text, html }) {
        try {
            if (!emailTransporter) {
                console.log('⚠ Email service not configured, skipping email');
                return;
            }

            // If text is provided but no HTML, wrap it in the generic template
            const emailHtml = html || (text ? genericEmailTemplate(subject, text) : undefined);

            await emailTransporter.sendMail({
                from: env.EMAIL_FROM,
                to,
                subject,
                text,
                ...(emailHtml && { html: emailHtml }),
                attachments: [getLogoAttachment()]
            });
            console.log(`✓ Email sent to: ${to}`);
        } catch (error) {
            console.error(`✗ Failed to send email to ${to}:`, error.message);
            throw error;
        }
    }
}

module.exports = new EmailService();
