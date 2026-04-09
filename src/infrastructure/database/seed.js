const { hashPassword } = require('../../shared/utils/password.util');
const { User, Patient, Doctor, AppointmentSlot, Specialization, DoctorSpecialization, sequelize } = require('./index');
const { UserRole } = require('../../domain/enums/user-role.enum');
const { Gender } = require('../../domain/enums/gender.enum');

/**
 * Comprehensive Database Seeding Script
 * Seeds: Patients, Doctors (3 categories), Specializations, Appointment Slots
 * Default password for all: SecurePass123!
 */

// ─── Helpers ────────────────────────────────────────────────────────────────

function generateSlotsForDoctor(doctorId, daysAhead = 30) {
    const slots = [];
    const timeSlots = [
        { start: '09:00', end: '09:30' },
        { start: '09:30', end: '10:00' },
        { start: '10:00', end: '10:30' },
        { start: '10:30', end: '11:00' },
        { start: '14:00', end: '14:30' },
        { start: '14:30', end: '15:00' },
        { start: '15:00', end: '15:30' },
        { start: '15:30', end: '16:00' },
    ];

    for (let i = 1; i <= daysAhead; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        const dayOfWeek = date.getDay();

        // Skip Sundays (0)
        if (dayOfWeek === 0) continue;

        const slotDate = date.toISOString().split('T')[0];

        // Saturdays only get morning slots
        const todaySlots = dayOfWeek === 6 ? timeSlots.slice(0, 4) : timeSlots;

        for (const time of todaySlots) {
            slots.push({
                doctorId,
                slotDate,
                startTime: time.start,
                endTime: time.end,
                isBooked: false
            });
        }
    }
    return slots;
}

// ─── Seed Data ───────────────────────────────────────────────────────────────

const seedData = async () => {
    try {
        console.log('🌱 Starting comprehensive database seeding...');

        const transaction = await sequelize.transaction();

        try {
            const hashedPassword = await hashPassword('SecurePass123!');

            // ── 1. Specializations ──────────────────────────────────────────
            console.log('  Creating specializations...');
            const specializationNames = [
                'Liver Related Diseases',
                'Spine Problems',
                'Kidney Diseases',
                'Ayurveda Treatments',
                'Digestive & Gastritis Problems',
                'Panchakarma Therapy',
                'Skin Disorders',
                'Respiratory Conditions',
                'Stress & Mental Wellness',
                'Joint & Arthritis Care',
                'Diabetes Management',
                'Women\'s Health',
            ];

            const specializations = {};
            for (const name of specializationNames) {
                const [spec] = await Specialization.findOrCreate({
                    where: { name },
                    defaults: { name },
                    transaction
                });
                specializations[name] = spec;
            }

            // ── 2. Patients ──────────────────────────────────────────────────
            console.log('  Creating patients...');
            const patientData = [
                { firstName: 'Nimal',     lastName: 'Perera',      email: 'patient1@example.com', phone: '+94711234567', dob: '1990-05-15', gender: Gender.MALE,   blood: 'O+',  address: 'Colombo 03, Sri Lanka',  ecName: 'Kamala Perera',    ecPhone: '+94771234567' },
                { firstName: 'Sanduni',   lastName: 'Silva',        email: 'patient2@example.com', phone: '+94722234567', dob: '1985-08-22', gender: Gender.FEMALE, blood: 'A+',  address: 'Kandy, Sri Lanka',        ecName: 'Ranjith Silva',    ecPhone: '+94772234567' },
                { firstName: 'Kasun',     lastName: 'Fernando',     email: 'patient3@example.com', phone: '+94733234567', dob: '1995-03-10', gender: Gender.MALE,   blood: 'B+',  address: 'Galle, Sri Lanka',        ecName: 'Sunil Fernando',   ecPhone: '+94773234567' },
                { firstName: 'Dilini',    lastName: 'Jayawardena',  email: 'patient4@example.com', phone: '+94744234567', dob: '1988-11-30', gender: Gender.FEMALE, blood: 'AB+', address: 'Negombo, Sri Lanka',      ecName: 'Malini Jayawardena', ecPhone: '+94774234567' },
                { firstName: 'Ruwan',     lastName: 'Bandara',      email: 'patient5@example.com', phone: '+94755234567', dob: '1992-07-18', gender: Gender.MALE,   blood: 'O-',  address: 'Matara, Sri Lanka',       ecName: 'Priya Bandara',    ecPhone: '+94775234567' },
            ];

            for (const p of patientData) {
                const user = await User.create({
                    email: p.email, passwordHash: hashedPassword,
                    firstName: p.firstName, lastName: p.lastName,
                    phone: p.phone, role: UserRole.PATIENT,
                    isActive: true, isEmailVerified: true
                }, { transaction });

                await Patient.create({
                    userId: user.id,
                    dateOfBirth: p.dob, gender: p.gender,
                    bloodGroup: p.blood, address: p.address,
                    emergencyContactName: p.ecName,
                    emergencyContactPhone: p.ecPhone
                }, { transaction });
            }

            // ── 3. Doctors ───────────────────────────────────────────────────
            console.log('  Creating doctors...');
            const doctorData = [
                // ── Ayurvedha Specialists ──
                {
                    firstName: 'Jagath', lastName: 'Perera',
                    email: 'doctor1@example.com', phone: '+94811234567',
                    title: 'Senior Consultant Ayurvedic Doctor',
                    category: 'Ayurvedha Specialists',
                    regNo: 'SLMC-AYU-20001', exp: 15, fee: 4500, videoFee: 3500, emailFee: 2500,
                    rating: 4.9, isVerified: true,
                    bio: 'Dr. Jagath Perera has over 15 years of experience. With empirical knowledge, he has solved chronic ailments like Cancer, Arthritis, Diabetes and Skin Diseases. Renowned speaker on Ayurvedic Treatment.',
                    specializations: ['Liver Related Diseases', 'Spine Problems', 'Kidney Diseases', 'Ayurveda Treatments', 'Digestive & Gastritis Problems'],
                    imgUrl: 'https://res.cloudinary.com/dojeklyno/image/upload/profile_images/doctor1.jpg',
                },
                {
                    firstName: 'Chamari', lastName: 'Wijesinghe',
                    email: 'doctor2@example.com', phone: '+94822234567',
                    title: 'Consultant Ayurvedic Doctor',
                    category: 'Ayurvedha Specialists',
                    regNo: 'SLMC-AYU-20002', exp: 10, fee: 3500, videoFee: 3000, emailFee: 2000,
                    rating: 4.7, isVerified: true,
                    bio: 'Dr. Chamari Wijesinghe specializes in herbal medicine and dietary consultations. She focuses on holistic wellness and preventive Ayurvedic care for women and children.',
                    specializations: ['Women\'s Health', 'Diabetes Management', 'Ayurveda Treatments', 'Digestive & Gastritis Problems'],
                    imgUrl: 'https://res.cloudinary.com/dojeklyno/image/upload/profile_images/doctor2.jpg',
                },
                {
                    firstName: 'Nimal', lastName: 'Karunaratne',
                    email: 'doctor3@example.com', phone: '+94833234567',
                    title: 'Ayurvedic Physician',
                    category: 'Ayurvedha Specialists',
                    regNo: 'SLMC-AYU-20003', exp: 8, fee: 3000, videoFee: 2500, emailFee: 1800,
                    rating: 4.6, isVerified: true,
                    bio: 'Dr. Nimal Karunaratne is dedicated to bringing traditional Ayurvedic healing into modern clinical practice, specializing in inflammatory and autoimmune conditions.',
                    specializations: ['Joint & Arthritis Care', 'Skin Disorders', 'Kidney Diseases'],
                    imgUrl: 'https://res.cloudinary.com/dojeklyno/image/upload/profile_images/doctor3.jpg',
                },
                // ── Panchakarma Specialists ──
                {
                    firstName: 'Samanthi', lastName: 'Jayawardena',
                    email: 'doctor4@example.com', phone: '+94844234567',
                    title: 'Senior Panchakarma Specialist',
                    category: 'Panchakarma Specialists',
                    regNo: 'SLMC-AYU-20004', exp: 12, fee: 5000, videoFee: 4000, emailFee: 3000,
                    rating: 4.9, isVerified: true,
                    bio: 'Dr. Samanthi Jayawardena is a leading Panchakarma specialist with 12 years of experience in detoxification therapies, rejuvenation treatments, and managing chronic lifestyle diseases.',
                    specializations: ['Panchakarma Therapy', 'Digestive & Gastritis Problems', 'Liver Related Diseases', 'Respiratory Conditions'],
                    imgUrl: 'https://res.cloudinary.com/dojeklyno/image/upload/profile_images/doctor4.jpg',
                },
                {
                    firstName: 'Pradeep', lastName: 'Fernando',
                    email: 'doctor5@example.com', phone: '+94855234567',
                    title: 'Panchakarma Therapist & Consultant',
                    category: 'Panchakarma Specialists',
                    regNo: 'SLMC-AYU-20005', exp: 9, fee: 4000, videoFee: 3500, emailFee: 2500,
                    rating: 4.8, isVerified: true,
                    bio: 'Dr. Pradeep Fernando combines ancient Panchakarma wisdom with evidence-based approaches to treat neurological conditions, obesity, and musculoskeletal disorders effectively.',
                    specializations: ['Panchakarma Therapy', 'Spine Problems', 'Joint & Arthritis Care'],
                    imgUrl: 'https://res.cloudinary.com/dojeklyno/image/upload/profile_images/doctor5.jpg',
                },
                {
                    firstName: 'Malithi', lastName: 'Gunasekara',
                    email: 'doctor6@example.com', phone: '+94866234567',
                    title: 'Panchakarma & Detox Specialist',
                    category: 'Panchakarma Specialists',
                    regNo: 'SLMC-AYU-20006', exp: 7, fee: 3500, videoFee: 3000, emailFee: 2000,
                    rating: 4.7, isVerified: false,
                    bio: 'Dr. Malithi Gunasekara focuses on Panchakarma-based detox programs tailored for modern lifestyle diseases, with expertise in Shirodhara, Abhyanga, and Basti treatments.',
                    specializations: ['Panchakarma Therapy', 'Stress & Mental Wellness', 'Skin Disorders'],
                    imgUrl: 'https://res.cloudinary.com/dojeklyno/image/upload/profile_images/doctor6.jpg',
                },
                // ── Wellness Experts ──
                {
                    firstName: 'Ruwan', lastName: 'Abeysekera',
                    email: 'doctor7@example.com', phone: '+94877234567',
                    title: 'Ayurvedic Wellness Consultant',
                    category: 'Wellness Experts',
                    regNo: 'SLMC-AYU-20007', exp: 11, fee: 3000, videoFee: 2500, emailFee: 1800,
                    rating: 4.8, isVerified: true,
                    bio: 'Dr. Ruwan Abeysekera is a certified wellness expert who integrates Ayurvedic lifestyle medicine with nutritional therapy, helping patients achieve hormonal balance and long-term vitality.',
                    specializations: ['Stress & Mental Wellness', 'Diabetes Management', 'Women\'s Health'],
                    imgUrl: 'https://res.cloudinary.com/dojeklyno/image/upload/profile_images/doctor7.jpg',
                },
                {
                    firstName: 'Kaushalya', lastName: 'De Silva',
                    email: 'doctor8@example.com', phone: '+94888234567',
                    title: 'Holistic Wellness Expert',
                    category: 'Wellness Experts',
                    regNo: 'SLMC-AYU-20008', exp: 6, fee: 2500, videoFee: 2000, emailFee: 1500,
                    rating: 4.6, isVerified: true,
                    bio: 'Dr. Kaushalya De Silva specializes in preventive wellness programs and corporate stress management through Ayurvedic lifestyle counseling, yoga therapy, and mindfulness practices.',
                    specializations: ['Stress & Mental Wellness', 'Respiratory Conditions', 'Digestive & Gastritis Problems'],
                    imgUrl: 'https://res.cloudinary.com/dojeklyno/image/upload/profile_images/doctor8.jpg',
                },
                {
                    firstName: 'Indika', lastName: 'Rajapaksha',
                    email: 'doctor9@example.com', phone: '+94899234567',
                    title: 'Senior Wellness & Nutrition Consultant',
                    category: 'Wellness Experts',
                    regNo: 'SLMC-AYU-20009', exp: 14, fee: 3500, videoFee: 3000, emailFee: 2000,
                    rating: 4.9, isVerified: true,
                    bio: 'Dr. Indika Rajapaksha is a renowned wellness authority combining Ayurvedic principles with modern nutritional science. He has helped thousands of patients reverse chronic conditions through diet and lifestyle modifications.',
                    specializations: ['Diabetes Management', 'Joint & Arthritis Care', 'Liver Related Diseases', 'Digestive & Gastritis Problems'],
                    imgUrl: 'https://res.cloudinary.com/dojeklyno/image/upload/profile_images/doctor9.jpg',
                },
            ];

            const createdDoctors = [];

            for (const d of doctorData) {
                const user = await User.create({
                    email: d.email, passwordHash: hashedPassword,
                    firstName: d.firstName, lastName: d.lastName,
                    phone: d.phone, role: UserRole.DOCTOR,
                    isActive: true, isEmailVerified: true,
                    profileImageUrl: d.imgUrl
                }, { transaction });

                const doctor = await Doctor.create({
                    userId: user.id,
                    registrationNumber: d.regNo,
                    experienceYears: d.exp,
                    consultationFee: d.fee,
                    videoConsultationFee: d.videoFee,
                    emailConsultationFee: d.emailFee,
                    bio: d.bio,
                    category: d.category,
                    title: d.title,
                    isVerified: d.isVerified
                }, { transaction });

                // Attach specializations
                for (const specName of d.specializations) {
                    const spec = specializations[specName];
                    if (spec) {
                        await DoctorSpecialization.create({
                            doctorId: doctor.id,
                            specializationId: spec.id
                        }, { transaction });
                    }
                }

                createdDoctors.push(doctor);
            }

            // ── 4. Appointment Slots ─────────────────────────────────────────
            console.log('  Creating appointment slots (next 30 days)...');
            let totalSlots = 0;

            for (const doctor of createdDoctors) {
                const slots = generateSlotsForDoctor(doctor.id, 30);
                // Bulk create for performance
                await AppointmentSlot.bulkCreate(slots, { transaction });
                totalSlots += slots.length;
            }

            // ── Commit ───────────────────────────────────────────────────────
            await transaction.commit();

            console.log('\n✅ Successfully seeded:');
            console.log(`  - ${specializationNames.length} specializations`);
            console.log(`  - 5 patients`);
            console.log(`  - 9 doctors (3 Ayurvedha, 3 Panchakarma, 3 Wellness)`);
            console.log(`  - ~${totalSlots} appointment slots (next 30 days)`);
            console.log('\n📋 Sample credentials (all passwords: SecurePass123!)');
            console.log('  Patients:');
            console.log('    patient1@example.com → Nimal Perera');
            console.log('    patient2@example.com → Sanduni Silva');
            console.log('  Doctors:');
            console.log('    doctor1@example.com  → Dr. Jagath Perera (Ayurvedha Specialist)');
            console.log('    doctor4@example.com  → Dr. Samanthi Jayawardena (Panchakarma)');
            console.log('    doctor7@example.com  → Dr. Ruwan Abeysekera (Wellness Expert)');

        } catch (error) {
            await transaction.rollback();
            throw error;
        }

    } catch (error) {
        console.error('✗ Seeding failed:', error.message);
        throw error;
    }
};

// Run seeding if executed directly
if (require.main === module) {
    const { initializeDatabase } = require('./index');

    initializeDatabase()
        .then(() => seedData())
        .then(() => {
            console.log('\n🌱 Seeding completed successfully');
            process.exit(0);
        })
        .catch((error) => {
            console.error('🌱 Seeding failed:', error);
            process.exit(1);
        });
}

module.exports = { seedData };
