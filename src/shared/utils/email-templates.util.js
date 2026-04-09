/**
 * Email Templates Utility
 * HTML email templates for appointment notifications
 * Supports both patient and doctor recipients
 */

const baseEmailTemplate = ({ title, greeting, bodyHtml }) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;700&display=swap');
        body { font-family: 'Manrope', Arial, sans-serif; line-height: 1.6; color: #3D3D3D; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
        .header { background-color: #26391D; color: #EFDABB; padding: 30px; text-align: center; }
        .header img { max-height: 80px; margin-bottom: 15px; }
        .header h1 { margin: 0; font-size: 24px; letter-spacing: 1px; text-transform: uppercase; color: #EFDABB; }
        .content { padding: 30px; }
        .greeting { font-size: 18px; font-weight: bold; color: #26391D; margin-bottom: 20px; }
        .details { background-color: #FFF9F0; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #B0660F; }
        .details p { margin: 8px 0; font-size: 15px; }
        .label { font-weight: bold; color: #26391D; display: inline-block; width: 140px; }
        .button-container { text-align: center; margin-top: 30px; }
        .button { background-color: #B0660F; color: #ffffff !important; padding: 14px 32px; border-radius: 30px; text-decoration: none; font-weight: bold; display: inline-block; text-transform: uppercase; font-size: 14px; letter-spacing: 1px; }
        .footer { background-color: #26391D; padding: 20px; text-align: center; font-size: 13px; color: #EFDABB; opacity: 0.9; }
        .footer a { color: #B0660F; text-decoration: none; }
        .brand-text { font-size: 12px; letter-spacing: 2px; color: #EFDABB; opacity: 0.7; margin-bottom: 5px; text-transform: uppercase; }
        .link-text { word-break: break-all; color: #666; font-size: 11px; margin-top: 20px; }
        .old { text-decoration: line-through; color: #999; }
        .new { color: #B0660F; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="cid:logo" alt="Setharana Ayurveda Logo" />
            <div class="brand-text">Setharana Ayurveda</div>
            <h1>${title}</h1>
        </div>
        <div class="content">
            <p class="greeting">${greeting},</p>
            ${bodyHtml}
        </div>
        <div class="footer">
            <p>Setharana Ayurveda Consultation Platform</p>
            <p>For support, contact us at <a href="mailto:support@setharana.com">support@setharana.com</a></p>
        </div>
    </div>
</body>
</html>
`;

/**
 * Appointment confirmation email template
 * @param {object} data - Appointment data
 * @param {string} recipientType - 'patient' or 'doctor'
 * @returns {string} HTML email content
 */
const appointmentConfirmationTemplate = (data, recipientType = 'patient') => {
    const { patientName, doctorName, appointmentDate, appointmentTime, consultationType, amount, appointmentId } = data;

    const isDoctor = recipientType === 'doctor';
    const greeting = isDoctor ? `Dear ${doctorName}` : `Dear ${patientName}`;
    const bodyText = isDoctor
        ? 'A new appointment has been confirmed with you. Here are the details:'
        : 'Your appointment has been successfully confirmed. Here are the details:';
    const personLabel = isDoctor ? 'Patient' : 'Doctor';
    const personName = isDoctor ? patientName : doctorName;

    const bodyHtml = `
        <p>${bodyText}</p>
        
        <div class="details">
            <p><span class="label">Appointment ID:</span> ${appointmentId}</p>
            <p><span class="label">${personLabel}:</span> ${personName}</p>
            <p><span class="label">Date:</span> ${appointmentDate}</p>
            <p><span class="label">Time:</span> ${appointmentTime}</p>
            <p><span class="label">Type:</span> ${consultationType}</p>
            <p><span class="label">Amount:</span> LKR ${amount}</p>
        </div>
        
        ${isDoctor
        ? '<p>Please ensure you are available at the scheduled time.</p>'
        : '<p>Please arrive 10 minutes before your scheduled time.</p><p>If you need to reschedule or cancel, please do so at least 12 hours in advance.</p>'}
    `;

    return baseEmailTemplate({ title: 'Appointment Confirmed', greeting, bodyHtml });
};

/**
 * Appointment cancellation email template
 * @param {object} data - Appointment data
 * @param {string} recipientType - 'patient' or 'doctor'
 * @returns {string} HTML email content
 */
const appointmentCancellationTemplate = (data, recipientType = 'patient') => {
    const { patientName, doctorName, appointmentDate, appointmentTime, appointmentId, refundAmount } = data;

    const isDoctor = recipientType === 'doctor';
    const greeting = isDoctor ? `Dear ${doctorName}` : `Dear ${patientName}`;
    const bodyText = isDoctor
        ? 'An appointment with you has been cancelled.'
        : 'Your appointment has been cancelled as requested.';
    const personLabel = isDoctor ? 'Patient' : 'Doctor';
    const personName = isDoctor ? patientName : doctorName;

    const bodyHtml = `
        <p>${bodyText}</p>
        
        <div class="details" style="border-left-color: #f44336; background-color: #fff1f0;">
            <p><span class="label">Appointment ID:</span> ${appointmentId}</p>
            <p><span class="label">${personLabel}:</span> ${personName}</p>
            <p><span class="label">Date:</span> ${appointmentDate}</p>
            <p><span class="label">Time:</span> ${appointmentTime}</p>
            ${!isDoctor && refundAmount ? `<p><span class="label">Refund Amount:</span> LKR ${refundAmount}</p>` : ''}
        </div>
        
        ${!isDoctor && refundAmount ? '<p>Your refund will be processed within 5-7 business days.</p>' : ''}
        <p>We hope to serve you again in the future.</p>
    `;

    return baseEmailTemplate({ title: 'Appointment Cancelled', greeting, bodyHtml });
};

/**
 * Appointment reschedule email template
 * @param {object} data - Appointment data
 * @param {string} recipientType - 'patient' or 'doctor'
 * @returns {string} HTML email content
 */
const appointmentRescheduleTemplate = (data, recipientType = 'patient') => {
    const { patientName, doctorName, oldDate, oldTime, newDate, newTime, appointmentId } = data;

    const isDoctor = recipientType === 'doctor';
    const greeting = isDoctor ? `Dear ${doctorName}` : `Dear ${patientName}`;
    const bodyText = isDoctor
        ? 'An appointment with you has been rescheduled.'
        : 'Your appointment has been successfully rescheduled.';
    const personLabel = isDoctor ? 'Patient' : 'Doctor';
    const personName = isDoctor ? patientName : doctorName;

    const bodyHtml = `
        <p>${bodyText}</p>
        
        <div class="details">
            <p><span class="label">Appointment ID:</span> ${appointmentId}</p>
            <p><span class="label">${personLabel}:</span> ${personName}</p>
            <p><span class="label">Previous Date:</span> <span class="old">${oldDate} at ${oldTime}</span></p>
            <p><span class="label">New Date:</span> <span class="new">${newDate} at ${newTime}</span></p>
        </div>
        
        ${isDoctor
        ? '<p>Please ensure you are available at the new scheduled time.</p>'
        : '<p>Please arrive 10 minutes before your scheduled time.</p>'}
    `;

    return baseEmailTemplate({ title: 'Appointment Rescheduled', greeting, bodyHtml });
};

/**
 * Consultation invite email template
 * @param {object} data - Consultation and user data
 * @returns {string} HTML email content
 */
const consultationInviteTemplate = (data) => {
    const { firstName, appointmentId, slotDate, slotTime, meetingLink } = data;

    const bodyHtml = `
        <p>Your video consultation room has been prepared and is ready for your appointment. Please use the secure link below to join the session at your scheduled time.</p>
        
        <div class="details">
            <p><span class="label">Appointment ID:</span> ${appointmentId}</p>
            <p><span class="label">Date:</span> ${slotDate}</p>
            <p><span class="label">Time:</span> ${slotTime}</p>
        </div>

        <div class="button-container">
            <a href="${meetingLink}" class="button">Visit Consultation Page</a>
        </div>

        <p class="link-text">If the button doesn't work, copy this link into your browser: <br/> ${meetingLink}</p>
        
        <p><strong>Important:</strong> You can join the room up to 30 minutes before the start time. The session will expire 2 hours after the scheduled start.</p>
    `;

    return baseEmailTemplate({ title: 'Video Consultation Ready', greeting: `Dear ${firstName}`, bodyHtml });
};

/**
 * Generic string text into HTML email converter
 */
const genericEmailTemplate = (subject, text) => {
    const bodyHtml = String(text).split('\n').filter(line => line.trim().length > 0).map(line => `<p>${line}</p>`).join('');
    return baseEmailTemplate({ title: subject, greeting: 'Hello', bodyHtml });
};

module.exports = {
    appointmentConfirmationTemplate,
    appointmentCancellationTemplate,
    appointmentRescheduleTemplate,
    consultationInviteTemplate,
    genericEmailTemplate
};
