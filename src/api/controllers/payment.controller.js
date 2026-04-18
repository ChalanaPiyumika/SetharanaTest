const paymentService = require('../../application/services/payment.service');
const appointmentRepository = require('../../infrastructure/repositories/appointment.repository');

let PDFDocument;
try {
    PDFDocument = require('pdfkit');
} catch (e) {
    console.warn('[PDF] pdfkit not installed. Run npm install pdfkit');
}

/**
 * Payment Controller
 * HTTP request handlers for payment operations
 */

class PaymentController {
    /**
     * Initiate payment
     * POST /api/v1/payments/initiate
     */
    async initiatePayment(req, res, next) {
        try {
            const { appointmentPublicId } = req.body;

            const paymentData = await paymentService.initiatePayment(appointmentPublicId);

            res.status(200).json({
                success: true,
                message: 'Payment initiated successfully',
                data: paymentData
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * PayHere webhook handler
     * POST /api/v1/payments/webhook
     */
    async handleWebhook(req, res, next) {
        console.log('[PayHere Webhook] Received notification');

        // Respond to PayHere IMMEDIATELY — PayHere waits for this before redirecting the browser
        // If we wait for DB/email processing, PayHere times out and never redirects the user
        res.status(200).send('OK');

        // Process the payment asynchronously in the background
        try {
            await paymentService.processWebhook(req.body);
        } catch (error) {
            console.error('[PayHere Webhook] Error:', error.message);
        }
    }

    /**
     * Simulate a successful payment (DEVELOPMENT ONLY)
     * POST /api/v1/payments/simulate-success/:publicId
     */
    async simulateSuccess(req, res, next) {
        try {
            const { publicId } = req.params;

            // Only allow in development
            if (process.env.NODE_ENV === 'production') {
                return res.status(403).json({
                    success: false,
                    message: 'Simulation not allowed in production'
                });
            }

            const result = await paymentService.simulateSuccess(publicId);

            res.status(200).json({
                success: true,
                message: result.message,
                data: result.appointment
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Download PDF Receipt
     * GET /api/v1/payments/:appointmentId/receipt
     */
    async downloadReceipt(req, res, next) {
        try {
            if (!PDFDocument) {
                return res.status(500).json({
                    success: false,
                    message: 'PDF generator not available on backend. Admin must run: npm install pdfkit'
                });
            }

            const { appointmentId } = req.params;
            const appointment = await appointmentRepository.findAppointmentById(appointmentId);

            if (!appointment) {
                return res.status(404).json({ success: false, message: 'Appointment not found' });
            }

            // check auth
            const userId = req.user.id;
            if (appointment.patient.userId !== userId && appointment.doctor.userId !== userId) {
                return res.status(403).json({ success: false, message: 'Unauthorized' });
            }

            if (appointment.paymentStatus !== 2) { // 2 = PAID
                return res.status(400).json({ success: false, message: 'Payment not completed or has been refunded' });
            }

            const transactionId = appointment.paymentId || `PH_ONL_${appointment.id}`;

            // Create A4 PDF
            const doc = new PDFDocument({
                margin: 50,
                size: 'A4'
            });
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=receipt-${appointment.publicId}.pdf`);
            doc.pipe(res);

            // --- Logo Placement ---
            const fs = require('fs');
            const path = require('path');

            // Allow checking for a logo at backend/src/assets/logo.png
            const logoPath = path.join(__dirname, '../../assets/logo.png');
            let logoImage = null;
            if (fs.existsSync(logoPath)) {
                logoImage = logoPath;
            }

            if (logoImage) {
                // Centered logo
                doc.image(logoImage, (595.28 - 120) / 2, 40, { width: 120 });
                doc.y = 100; // Move cursor down
            } else {
                doc.fillColor('#2e7d32').fontSize(20).font('Helvetica-Bold').text('Ayurveda Seth Arana', { align: 'center' });
                doc.moveDown(1.5);
            }

            // Headers
            doc.fillColor('#111111').fontSize(16).font('Helvetica-Bold').text('PAYMENT RECEIPT', { align: 'center' });
            doc.moveDown(0.5);
            doc.fontSize(10).font('Helvetica').text('Seth Arana Ayurveda Consultation Platform', { align: 'center' });
            doc.text('www.setharana.com | info@setharana.com', { align: 'center' });
            doc.text('Phone: +94 XX XXX XXXX', { align: 'center' });
            doc.moveDown(1.5);

            // Utility to draw a separator line
            const drawLine = () => {
                doc.strokeColor('#cccccc').lineWidth(1);
                doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
                doc.moveDown(1);
            };

            const leftX = 50;
            const rightX = 200;

            const writeRow = (label, value) => {
                const currentY = doc.y;
                doc.text(label, leftX, currentY);
                doc.text(`: ${value}`, rightX, currentY);
            };

            drawLine();

            // Receipt Information
            const SL_TIMEZONE = 'Asia/Colombo';
            const rawDate = new Date();
            const dateIssued = rawDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric', timeZone: SL_TIMEZONE });
            const timeGenerated = rawDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: SL_TIMEZONE });

            const pDateObj = appointment.paymentDate ? new Date(appointment.paymentDate) : rawDate;
            const pDateStr = pDateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric', timeZone: SL_TIMEZONE });
            const pTimeStr = pDateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: SL_TIMEZONE });

            doc.fontSize(10).font('Helvetica');
            writeRow('Receipt No', appointment.publicId);
            writeRow('Payment ID', appointment.publicId.replace('APT-', 'PAY-'));
            writeRow('Date Issued', dateIssued);
            writeRow('Payment Date', `${pDateStr} – ${pTimeStr}`);
            writeRow('Receipt Generated', `${dateIssued} – ${timeGenerated}`);

            doc.moveDown(1);
            drawLine();

            // Patient & Consultation Details
            doc.font('Helvetica-Bold').text('PATIENT & CONSULTATION DETAILS', leftX, doc.y);
            doc.moveDown(1);

            doc.font('Helvetica');
            writeRow('Patient Name', `${appointment.patient.user.firstName} ${appointment.patient.user.lastName}`);
            writeRow('Consulting Doctor', `Dr. ${appointment.doctor.user.firstName} ${appointment.doctor.user.lastName}`);
            writeRow('Consultation Type', appointment.consultationType === 1 ? 'Online Video Consultation' : appointment.consultationType === 3 ? 'Email Consultation' : 'In-Person Consultation');
            doc.moveDown(1);
            const consultDate = new Date(appointment.slot.slotDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });

            let formattedTime = appointment.slot.startTime;
            if (formattedTime && formattedTime.includes(':')) {
                const [hrStr, minStr] = formattedTime.split(':');
                let h = parseInt(hrStr, 10);
                const ampm = h >= 12 ? 'PM' : 'AM';
                h = h % 12 || 12; // 0 becomes 12
                formattedTime = `${h}.${minStr} ${ampm}`;
            }

            writeRow('Consultation Date', consultDate);
            writeRow('Scheduled Time', formattedTime);

            doc.moveDown(1);
            drawLine();

            // Payment Details
            doc.font('Helvetica-Bold').text('PAYMENT DETAILS', leftX, doc.y);
            doc.moveDown(1);

            doc.font('Helvetica');
            writeRow('Payment Method', 'PayHere (Online Card Payment)');
            writeRow('Transaction ID', transactionId);
            writeRow('Payment Status', 'SUCCESSFUL');
            writeRow('Currency', 'LKR');

            doc.moveDown(1);
            drawLine();

            // Amount Breakdown
            doc.font('Helvetica-Bold').text('AMOUNT BREAKDOWN', leftX, doc.y);
            doc.moveDown(1);

            const totalAmount = parseFloat(appointment.amount) || 0;
            const serviceFee = 200;
            const consultationFee = totalAmount > serviceFee ? totalAmount - serviceFee : totalAmount;

            doc.font('Helvetica');
            writeRow('Consultation Fee', `Rs. ${consultationFee.toFixed(2)}`);
            writeRow('Platform Service Fee', `Rs.   ${serviceFee.toFixed(2)}`);

            doc.moveDown(0.5);
            doc.strokeColor('#cccccc').lineWidth(1).moveTo(leftX, doc.y).lineTo(350, doc.y).stroke();
            doc.moveDown(0.5);

            doc.font('Helvetica-Bold');
            writeRow('TOTAL AMOUNT PAID', `Rs. ${totalAmount.toFixed(2)}`);
            doc.moveDown(1.5);

            // Amount in words
            doc.font('Helvetica').text('Amount in Words:', leftX, doc.y);
            const numToWords = (num) => {
                const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
                const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
                let n = ('000000000' + num).slice(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
                if (!n) return ''; let str = '';
                if (n[3] != 0) str += (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ';
                if (n[4] != 0) str += a[Number(n[4])] + 'Hundred ';
                if (n[5] != 0) str += ((str !== '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]);
                return str.trim() ? `${str.trim()} Rupees Only` : '';
            };
            const words = numToWords(parseInt(appointment.amount) || 0);
            doc.font('Helvetica-Oblique').text(words, leftX, doc.y);

            doc.moveDown(1);
            drawLine();

            // Footer
            doc.moveDown(1);
            doc.font('Helvetica').text('Thank you for choosing Seth Arana Ayurveda Consultation Platform.', leftX, doc.y, { align: 'center', width: 495 });
            doc.moveDown(1);
            doc.text('This is a system-generated payment receipt and does not require', leftX, doc.y, { align: 'center', width: 495 });
            doc.text('a signature. Payments are subject to Seth Arana refund policy.', leftX, doc.y, { align: 'center', width: 495 });
            doc.moveDown(2);

            doc.font('Helvetica-Oblique').fontSize(9).fillColor('#888888');
            doc.text('Generated by Seth Arana Consultation System', leftX, doc.y, { align: 'center', width: 495 });

            doc.moveDown(1);
            drawLine();


            doc.end();

        } catch (error) {
            next(error);
        }
    }
}

module.exports = new PaymentController();
