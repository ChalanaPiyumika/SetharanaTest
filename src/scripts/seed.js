const { 
    sequelize, 
    User, 
    Doctor, 
    Patient, 
    Specialization, 
    DoctorSpecialization, 
    DoctorReview, 
    AppointmentSlot 
} = require('../infrastructure/database');
const bcrypt = require('bcryptjs');
const { generateSlotsForDate } = require('../shared/utils/slot-generator.util');
const { Gender } = require('../domain/enums/gender.enum');

const seedDatabase = async () => {
    try {
        console.log('--- Starting Database Seeding ---');

        // 1. Truncate all tables
        console.log('Truncating database...');
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
        await sequelize.sync({ force: true });
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
        console.log('✓ Database truncated');

        const hashedPassword = await bcrypt.hash('Password123', 10);

        // 2. Seed Specializations
        console.log('Seeding specializations...');
        const specs = [
            { name: 'General Ayurveda', description: 'Basic Ayurvedic consultations' },
            { name: 'Panchakarma', description: 'Detoxification and rejuvenation' },
            { name: 'Dravyaguna', description: 'Ayurvedic pharmacology' },
            { name: 'Shalya Chikitsa', description: 'Ayurvedic surgery' },
            { name: 'Kaumarbhritya', description: 'Pediatrics' },
            { name: 'Kayachikitsa', description: 'Internal medicine' },
            { name: 'Yoga & Meditation', description: 'Mind and body wellness' },
            { name: 'Skin Care', description: 'Ayurvedic dermatology' }
        ];
        const createdSpecs = await Specialization.bulkCreate(specs);
        console.log(`✓ Seeded ${createdSpecs.length} specializations`);

        // 3. Seed Doctors (10)
        console.log('Seeding doctors...');
        const doctorData = [
            { first: 'Anura', last: 'Kumara', category: 'Ayurvedha Specialists', fee: 2000, bio: 'Expert in Kayachikitsa with 15 years of experience.' },
            { first: 'Saman', last: 'Perera', category: 'Ayurvedha Specialists', fee: 1800, bio: 'Specialist in Dravyaguna and herbal medicine.' },
            { first: 'Nilanthi', last: 'Silva', category: 'Panchakarma Specialists', fee: 2500, bio: 'Renowned Panchakarma therapist specializing in detox.' },
            { first: 'Kamal', last: 'Gunawardena', category: 'Wellness Experts', fee: 1500, bio: 'Wellness coach focused on stress management through Yoga.' },
            { first: 'Priyani', last: 'Fernando', category: 'Ayurvedha Specialists', fee: 2200, bio: 'Pediatric specialist with a focus on child immunity.' },
            { first: 'Rohan', last: 'Jayasinghe', category: 'Panchakarma Specialists', fee: 3000, bio: 'Advanced Panchakarma techniques for chronic pain.' },
            { first: 'Sunil', last: 'Ratnayake', category: 'Ayurvedha Specialists', fee: 1900, bio: 'Expert in Ayurvedic dermatology and skin disorders.' },
            { first: 'Indrani', last: 'Wickramasinghe', category: 'Wellness Experts', fee: 1600, bio: 'Holistic wellness expert for lifestyle diseases.' },
            { first: 'Mahesh', last: 'De Silva', category: 'Ayurvedha Specialists', fee: 2100, bio: 'Consultant Ayurvedic surgeon with traditional expertise.' },
            { first: 'Chitra', last: 'Ranasinghe', category: 'Wellness Experts', fee: 1400, bio: 'Specialist in Ayurvedic dietetics and nutrition.' }
        ];

        for (let i = 0; i < doctorData.length; i++) {
            const data = doctorData[i];
            const user = await User.create({
                firstName: data.first,
                lastName: data.last,
                email: `doctor${i + 1}@example.com`,
                password: hashedPassword,
                role: 'DOCTOR',
                isVerified: true
            });

            const doctor = await Doctor.create({
                userId: user.id,
                registrationNumber: `SLMC-D-NO-${1000 + i}`,
                experienceYears: 5 + i,
                bio: data.bio,
                category: data.category,
                videoConsultationFee: data.fee,
                emailConsultationFee: data.fee - 500,
                rating: (4 + Math.random()).toFixed(1),
                isVerified: true,
                imgUrl: `/uploads/profiles/doc${(i % 5) + 1}.jpg`
            });

            // Link specialization (random)
            const specId = createdSpecs[i % createdSpecs.length].id;
            await DoctorSpecialization.create({
                doctorId: doctor.id,
                specializationId: specId
            });

            // Seed Slots (for next 14 days)
            const slots = [];
            const startDate = new Date();
            for (let d = 0; d < 14; d++) {
                const dateHeader = new Date();
                dateHeader.setDate(startDate.getDate() + d);
                const dateStr = dateHeader.toISOString().split('T')[0];
                
                // 9 AM to 12 PM slots
                const morningSlots = generateSlotsForDate(doctor.id, dateStr, '09:00', '12:00', 30);
                slots.push(...morningSlots);
            }
            await AppointmentSlot.bulkCreate(slots);

            // Seed Review (1 per doctor)
            await DoctorReview.create({
                doctorId: doctor.id,
                reviewerName: 'Anonymous Patient',
                stars: 5,
                reviewText: 'Excellent service and very knowledgeable doctor.'
            });
        }
        console.log('✓ Seeded 10 doctors with slots and specializations');

        // 4. Seed Patients (5)
        console.log('Seeding patients...');
        const patientData = [
            { first: 'John', last: 'Doe', email: 'patient1@example.com' },
            { first: 'Jane', last: 'Smith', email: 'patient2@example.com' },
            { first: 'Mike', last: 'Wilson', email: 'patient3@example.com' },
            { first: 'Sarah', last: 'Taylor', email: 'patient4@example.com' },
            { first: 'Robert', last: 'Brown', email: 'patient5@example.com' }
        ];

        for (let i = 0; i < patientData.length; i++) {
            const data = patientData[i];
            const user = await User.create({
                firstName: data.first,
                lastName: data.last,
                email: data.email,
                password: hashedPassword,
                role: 'PATIENT',
                isVerified: true
            });

            await Patient.create({
                userId: user.id,
                dateOfBirth: '1990-01-01',
                gender: i % 2 === 0 ? Gender.MALE : Gender.FEMALE
            });
        }
        console.log('✓ Seeded 5 patients');

        console.log('--- Seeding Completed Successfully ---');
        process.exit(0);
    } catch (error) {
        console.error('✗ Seeding failed:', error);
        if (error.errors) {
            console.error('Validation Errors:', JSON.stringify(error.errors, null, 2));
        }
        process.exit(1);
    }
};

seedDatabase();
