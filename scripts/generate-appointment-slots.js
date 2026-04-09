const { Doctor, DoctorAvailability, AppointmentSlot } = require('../src/infrastructure/database');
const { generateSlotsForDays } = require('../src/shared/utils/slot-generator.util');

async function generateSlots() {
    try {
        console.log('🚀 Starting Slot Generation Script...');

        // 1. Get all doctors
        const doctors = await Doctor.findAll({ where: { deletedAt: null } });
        console.log(`   ℹ Found ${doctors.id || doctors.length} doctors.`);

        const DAYS_AHEAD = 30;
        let totalSlotsCreated = 0;
        let doctorsUpdated = 0;

        for (const doctor of doctors) {
            const doctorId = doctor.id;
            
            // 2. Check if doctor has availability
            let availabilities = await DoctorAvailability.findAll({ 
                where: { doctorId, deletedAt: null } 
            });

            if (availabilities.length === 0) {
                console.log(`   🔸 Doctor ${doctorId}: No availability found. Adding defaults (Mon/Wed/Fri)...`);
                // Add default availability: Mon(1), Wed(3), Fri(5) 09:00 - 17:00
                const defaults = [1, 3, 5].map(day => ({
                    doctorId,
                    dayOfWeek: day,
                    startTime: '09:00',
                    endTime: '17:00',
                    slotDuration: 30
                }));
                availabilities = await DoctorAvailability.bulkCreate(defaults);
                doctorsUpdated++;
            }

            // 3. Generate slots for next 30 days
            const slotsData = generateSlotsForDays(availabilities, DAYS_AHEAD);
            
            if (slotsData.length > 0) {
                // 4. Bulk insert slots (ignore duplicates based on doctorId, slotDate, startTime)
                // Since our model doesn't have a unique constraint on these specifically in the DB 
                // we'll just check for existence first to be safe, or use ignoreDuplicates if supported
                const existingCount = await AppointmentSlot.count({ where: { doctorId } });
                
                // For simplicity in this script, we'll just insert non-existent ones
                // Or clear future slots first for this doctor?
                // Let's just create them. If the DB has a unique constraint, it will fail/ignore.
                try {
                    await AppointmentSlot.bulkCreate(slotsData, { ignoreDuplicates: true });
                    totalSlotsCreated += slotsData.length;
                    console.log(`   ✅ Doctor ${doctorId}: Generated ${slotsData.length} slots.`);
                } catch (err) {
                    console.error(`   ❌ Doctor ${doctorId}: Failed to bulk create slots:`, err.message);
                }
            }
        }

        console.log('\n✨ Slot Generation Completed!');
        console.log(`   🔹 Doctors with new schedules: ${doctorsUpdated}`);
        console.log(`   🔹 Total potential slots generated: ${totalSlotsCreated}`);
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Critical Error during slot generation:', error);
        process.exit(1);
    }
}

generateSlots();
