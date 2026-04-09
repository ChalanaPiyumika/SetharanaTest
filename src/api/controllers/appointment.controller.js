const appointmentService = require('../../application/services/appointment.service');
const patientRepository = require('../../infrastructure/repositories/patient.repository');
const doctorRepository = require('../../infrastructure/repositories/doctor.repository');

/**
 * Appointment Controller
 * HTTP request handlers for appointments
 */

class AppointmentController {
    /**
     * Book appointment
     * POST /api/v1/appointments
     */
    async bookAppointment(req, res, next) {
        try {
            const userId = req.user.id;

            // Get patient profile
            const patient = await patientRepository.findByUserId(userId);
            if (!patient) {
                return res.status(404).json({
                    success: false,
                    message: 'Patient profile not found'
                });
            }

            const result = await appointmentService.bookAppointment(patient.id, req.body);

            res.status(201).json({
                success: true,
                message: 'Appointment booked successfully. Please complete payment.',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get available slots for a doctor
     * GET /api/v1/slots/doctor/:doctorId
     */
    async getAvailableSlots(req, res, next) {
        try {
            const doctorId = parseInt(req.params.doctorId);
            const { startDate, endDate } = req.query;

            console.log(`Getting slots for doctor: ${doctorId}, start: ${startDate}, end: ${endDate}`);

            const slots = await appointmentService.getAvailableSlots(
                doctorId,
                startDate ? new Date(startDate) : null,
                endDate ? new Date(endDate) : null
            );

            console.log(`Found ${slots.length} slots`);

            res.status(200).json({
                success: true,
                data: slots
            });
        } catch (error) {
            console.error('Error getting slots:', error);
            next(error);
        }
    }

    /**
     * Get my appointments
     * GET /api/v1/appointments
     */
    async getMyAppointments(req, res, next) {
        try {
            const userId = req.user.id;
            const userRole = req.user.role;
            const { status } = req.query;

            let appointments;

            if (userRole === 'PATIENT') {
                const patient = await patientRepository.findByUserId(userId);
                if (!patient) {
                    return res.status(404).json({
                        success: false,
                        message: 'Patient profile not found'
                    });
                }
                appointments = await appointmentService.getPatientAppointments(
                    patient.id,
                    { status: status ? parseInt(status) : undefined }
                );
            } else if (userRole === 'DOCTOR') {
                const doctor = await doctorRepository.findByUserId(userId);
                if (!doctor) {
                    return res.status(404).json({
                        success: false,
                        message: 'Doctor profile not found'
                    });
                }
                appointments = await appointmentService.getDoctorAppointments(
                    doctor.id,
                    { status: status ? parseInt(status) : undefined }
                );
            } else {
                return res.status(403).json({
                    success: false,
                    message: 'Unauthorized'
                });
            }

            res.status(200).json({
                success: true,
                data: appointments
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get appointment details
     * GET /api/v1/appointments/:id
     */
    async getAppointmentById(req, res, next) {
        try {
            const appointmentId = parseInt(req.params.id);
            const appointment = await appointmentService.getAppointmentById(appointmentId);

            res.status(200).json({
                success: true,
                data: appointment
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get appointment details by public ID
     * GET /api/v1/appointments/public/:publicId
     */
    async getAppointmentByPublicId(req, res, next) {
        try {
            const { publicId } = req.params;
            const appointment = await appointmentService.getAppointmentByPublicId(publicId);

            res.status(200).json({
                success: true,
                data: appointment
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Reschedule appointment
     * PUT /api/v1/appointments/:id/reschedule
     */
    async rescheduleAppointment(req, res, next) {
        try {
            const userId = req.user.id;
            const appointmentId = parseInt(req.params.id);
            const { newSlotId } = req.body;

            // Get patient profile
            const patient = await patientRepository.findByUserId(userId);
            if (!patient) {
                return res.status(404).json({
                    success: false,
                    message: 'Patient profile not found'
                });
            }

            const updated = await appointmentService.rescheduleAppointment(
                appointmentId,
                patient.id,
                newSlotId
            );

            res.status(200).json({
                success: true,
                message: 'Appointment rescheduled successfully',
                data: updated
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Cancel appointment
     * DELETE /api/v1/appointments/:id
     */
    async cancelAppointment(req, res, next) {
        try {
            const userId = req.user.id;
            const userRole = req.user.role;
            const appointmentId = parseInt(req.params.id);
            const { cancellationReason } = req.body;

            const updated = await appointmentService.cancelAppointment(
                appointmentId,
                userId,
                userRole,
                cancellationReason || 'No reason provided'
            );

            res.status(200).json({
                success: true,
                message: 'Appointment cancelled successfully',
                data: updated
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new AppointmentController();
