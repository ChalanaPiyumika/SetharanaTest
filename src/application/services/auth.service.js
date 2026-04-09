const userRepository = require('../../infrastructure/repositories/user.repository');
const patientRepository = require('../../infrastructure/repositories/patient.repository');
const doctorRepository = require('../../infrastructure/repositories/doctor.repository');
const { hashPassword, comparePassword } = require('../../shared/utils/password.util');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../../shared/utils/jwt.util');
const { UserRole } = require('../../domain/enums/user-role.enum');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const { OAuth2Client } = require('google-auth-library');
const appleSignin = require('apple-signin-auth');
const emailService = require('./email.service');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Authentication Service
 * Business logic for authentication operations
 */

class AuthService {
    /**
     * Register a new user
     * @param {object} userData - User registration data
     * @returns {Promise<object>} Created user (without password)
     */
    async registerUser(userData) {
        // Check if user already exists
        const existingUser = await userRepository.findByEmail(userData.email);
        if (existingUser) {
            const error = new Error('User with this email already exists');
            error.statusCode = 409; // Conflict
            throw error;
        }

        // Hash password
        const passwordHash = await hashPassword(userData.password);

        // Create user
        const user = await userRepository.create({
            email: userData.email,
            passwordHash,
            firstName: userData.firstName,
            lastName: userData.lastName,
            phone: userData.phone || null,
            role: userData.role || 'PATIENT'
        });

        // Auto-create empty profile based on role
        const logMsg1 = `[REGISTRATION] User created with ID: ${user.id}, Role: "${user.role}" (type: ${typeof user.role})`;
        console.log(logMsg1);


        const logMsg2 = `[REGISTRATION] UserRole.PATIENT = "${UserRole.PATIENT}", UserRole.DOCTOR = "${UserRole.DOCTOR}"`;
        console.log(logMsg2);


        const logMsg3 = `[REGISTRATION] Comparison: user.role === UserRole.PATIENT? ${user.role === UserRole.PATIENT}`;
        console.log(logMsg3);


        const logMsg4 = `[REGISTRATION] Comparison: user.role === UserRole.DOCTOR? ${user.role === UserRole.DOCTOR}`;
        console.log(logMsg4);


        try {
            if (user.role === UserRole.PATIENT) {
                await patientRepository.create({
                    userId: user.id
                    // All other fields are optional and can be filled later via profile update
                });
            } else if (user.role === UserRole.DOCTOR) {
                await doctorRepository.create({
                    userId: user.id,
                    isVerified: false
                    // registrationNumber defaults to empty string, can be filled later
                });
            }
        } catch (profileError) {
            // If profile creation fails, log error but don't fail registration
            console.error(`Profile auto-creation failed for user ${user.id}:`, profileError.message);
        }

        // Return user without password
        const { passwordHash: _, ...userWithoutPassword } = user.toJSON();
        return userWithoutPassword;
    }

    /**
     * Login user
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise<object>} Access and refresh tokens
     */
    async loginUser(email, password) {
        // Find user
        const user = await userRepository.findByEmail(email);
        if (!user) {
            const error = new Error('Invalid email or password');
            error.statusCode = 401;
            throw error;
        }

        // Check if user is active
        if (!user.isActive) {
            const error = new Error('Account is deactivated. Please contact support.');
            error.statusCode = 403;
            throw error;
        }

        // Verify password
        const isPasswordValid = await comparePassword(password, user.passwordHash);
        if (!isPasswordValid) {
            const error = new Error('Invalid email or password');
            error.statusCode = 401;
            throw error;
        }

        // Generate tokens
        const tokenPayload = {
            id: user.id,
            publicId: user.publicId,
            email: user.email,
            role: user.role
        };

        const accessToken = generateAccessToken(tokenPayload);
        const refreshToken = generateRefreshToken(tokenPayload);

        return {
            accessToken,
            refreshToken,
            user: {
                publicId: user.publicId,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                authProvider: user.authProvider,
                profileImageUrl: user.profileImageUrl
            }
        };
    }

    /**
     * Social login for Google and Apple
     * @param {string} provider - 'google' or 'apple'
     * @param {string} token - The OAuth ID token
     * @returns {Promise<object>} Access and refresh tokens
     */
    async socialLogin(provider, token) {
        let payload = null;
        let providerId = null;

        if (provider === 'google') {
            try {
                // To support standard React custom buttons, frontend passes an access token
                const userInfoRes = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                payload = userInfoRes.data;
                providerId = payload.sub; // Google ID
            } catch (err) {
                console.error('Google token verification failed', err.response?.data || err.message);
                const error = new Error('Invalid Google token');
                error.statusCode = 401;
                throw error;
            }
        } else if (provider === 'apple') {
            try {
                payload = await appleSignin.verifyIdToken(token, {
                    audience: process.env.APPLE_CLIENT_ID,
                    ignoreExpiration: true, // You may want to handle expiration depending on the flow
                });
                providerId = payload.sub; // Apple ID
            } catch (err) {
                const error = new Error('Invalid Apple token');
                error.statusCode = 401;
                throw error;
            }
        } else {
            const error = new Error('Unsupported provider');
            error.statusCode = 400;
            throw error;
        }

        const email = payload.email;
        if (!email) {
            const error = new Error('Email not provided by social account');
            error.statusCode = 400;
            throw error;
        }

        // Find existing user by email
        let user = await userRepository.findByEmail(email);

        if (user) {
            // Check if active
            if (!user.isActive) {
                const error = new Error('Account is deactivated. Please contact support.');
                error.statusCode = 403;
                throw error;
            }

            // Link accounts if they aren't linked yet
            const updateData = {};
            if (provider === 'google' && !user.googleId) updateData.googleId = providerId;
            if (provider === 'apple' && !user.appleId) updateData.appleId = providerId;
            
            if (Object.keys(updateData).length > 0) {
                user = await userRepository.update(user.id, updateData);
            }
        } else {
            // Create a new user for this social account
            const firstName = payload.given_name || (payload.name ? payload.name.split(' ')[0] : 'User');
            const lastName = payload.family_name || (payload.name && payload.name.split(' ').length > 1 ? payload.name.split(' ').slice(1).join(' ') : 'Name');
            
            const createData = {
                email,
                firstName,
                lastName,
                role: 'PATIENT',
                authProvider: provider.toUpperCase(),
                passwordHash: null,
                isEmailVerified: true
            };

            if (provider === 'google') createData.googleId = providerId;
            if (provider === 'apple') createData.appleId = providerId;

            user = await userRepository.create(createData);

            // Auto-create patient profile
            try {
                await patientRepository.create({ userId: user.id });
            } catch (err) {
                console.error(`Profile auto-creation failed for social user ${user.id}:`, err.message);
            }
        }

        // Generate tokens
        const tokenPayload = {
            id: user.id,
            publicId: user.publicId,
            email: user.email,
            role: user.role
        };

        const accessToken = generateAccessToken(tokenPayload);
        const refreshToken = generateRefreshToken(tokenPayload);

        return {
            accessToken,
            refreshToken,
            user: {
                publicId: user.publicId,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                authProvider: user.authProvider,
                profileImageUrl: user.profileImageUrl
            }
        };
    }

    /**
     * Refresh access token
     * @param {string} refreshToken - Refresh token
     * @returns {Promise<object>} New access token
     */
    async refreshToken(refreshToken) {
        try {
            // Verify refresh token
            const decoded = verifyRefreshToken(refreshToken);

            // Find user to ensure they still exist and are active
            const user = await userRepository.findById(decoded.id);
            if (!user || !user.isActive) {
                const error = new Error('Invalid refresh token');
                error.statusCode = 401;
                throw error;
            }

            // Generate new access token
            const tokenPayload = {
                id: user.id,
                publicId: user.publicId,
                email: user.email,
                role: user.role
            };

            const accessToken = generateAccessToken(tokenPayload);

            return { accessToken };
        } catch (error) {
            if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
                const newError = new Error('Invalid or expired refresh token');
                newError.statusCode = 401;
                throw newError;
            }
            throw error;
        }
    }

    /**
     * Logout user (invalidate refresh token)
     * Note: In a production system, you would store refresh tokens in a database
     * and mark them as revoked. For this iteration, we'll just return success.
     * @param {string} refreshToken - Refresh token to invalidate
     * @returns {Promise<object>} Success message
     */
    async logoutUser(refreshToken) {
        // TODO: In future iterations, implement token blacklisting
        // For now, just verify the token is valid
        try {
            verifyRefreshToken(refreshToken);
            return { message: 'Logged out successfully' };
        } catch (error) {
            const newError = new Error('Invalid refresh token');
            newError.statusCode = 401;
            throw newError;
        }
    }

    /**
     * Forgot password (send reset token)
     * @param {string} email - User email
     * @returns {Promise<object>} Success message
     */
    async forgotPassword(email) {
        const user = await userRepository.findByEmail(email);

        if (!user) {
            const error = new Error('User not registered with this email. Please sign up.');
            error.statusCode = 404;
            throw error;
        }

        // Generate 6 digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Set expiry to 15 minutes from now
        const expiry = new Date();
        expiry.setMinutes(expiry.getMinutes() + 15);

        await userRepository.update(user.id, {
            resetPasswordOtp: otp,
            resetPasswordOtpExpiry: expiry
        });

        // Send OTP email
        try {
            await emailService.sendEmail({
                to: user.email,
                subject: 'Password Reset Verification Code',
                text: `Hello,\n\nYour password reset code is: ${otp}\n\nThis code is valid for 15 minutes.\n\nThank you.`
            });
            console.log(`Password reset OTP sent to: ${email}`);
        } catch (err) {
            console.error(`Failed to send password reset email to ${email}:`, err.message);
            const error = new Error('Failed to send OTP email. Please try again later.');
            error.statusCode = 500;
            throw error;
        }

        return { message: 'An OTP has been sent to your email address.' };
    }

    /**
     * Verify OTP
     * @param {string} email
     * @param {string} otp
     */
    async verifyOtp(email, otp) {
        const user = await userRepository.findByEmail(email);

        if (!user || user.resetPasswordOtp !== otp) {
            const error = new Error('Invalid OTP');
            error.statusCode = 400;
            throw error;
        }

        if (new Date() > new Date(user.resetPasswordOtpExpiry)) {
            const error = new Error('OTP has expired');
            error.statusCode = 400;
            throw error;
        }

        return { message: 'OTP verified successfully' };
    }

    /**
     * Reset Password using OTP
     * @param {string} email
     * @param {string} otp
     * @param {string} newPassword
     */
    async resetPassword(email, otp, newPassword) {
        const user = await userRepository.findByEmail(email);

        if (!user || user.resetPasswordOtp !== otp) {
            const error = new Error('Invalid OTP');
            error.statusCode = 400;
            throw error;
        }

        if (new Date() > new Date(user.resetPasswordOtpExpiry)) {
            const error = new Error('OTP has expired');
            error.statusCode = 400;
            throw error;
        }

        const newHash = await hashPassword(newPassword);
        
        await userRepository.update(user.id, { 
            passwordHash: newHash,
            resetPasswordOtp: null,
            resetPasswordOtpExpiry: null
        });

        return { message: 'Password reset successfully' };
    }

    /**
     * Get full user profile from DB
     * @param {number} userId - Authenticated user ID
     * @returns {Promise<object>} User without passwordHash
     */
    async getFullProfile(userId) {
        const user = await userRepository.findById(userId);
        if (!user) {
            const error = new Error('User not found');
            error.statusCode = 404;
            throw error;
        }
        const { passwordHash: _, ...userWithoutPassword } = user.toJSON();
        return userWithoutPassword;
    }

    /**
     * Update user profile
     * @param {number} userId - Authenticated user ID
     * @param {object} updateData - Fields to update (firstName, lastName, phone, country, city, timezone, profileImageUrl)
     * @returns {Promise<object>} Updated user (without passwordHash)
     */
    async updateProfile(userId, updateData) {
        const user = await userRepository.findById(userId);
        if (!user) {
            const error = new Error('User not found');
            error.statusCode = 404;
            throw error;
        }

        // Whitelist allowed profile fields
        const allowed = ['firstName', 'lastName', 'phone', 'country', 'city', 'timezone', 'profileImageUrl'];
        const filteredData = {};
        for (const key of allowed) {
            if (updateData[key] !== undefined) {
                filteredData[key] = updateData[key];
            }
        }

        const updated = await userRepository.update(userId, filteredData);
        const { passwordHash: _, ...userWithoutPassword } = updated.toJSON();
        return userWithoutPassword;
    }

    /**
     * Change user password
     * @param {number} userId - Authenticated user ID
     * @param {string} currentPassword - The user's current password
     * @param {string} newPassword - The new password to set
     * @returns {Promise<object>} Success message
     */
    async changePassword(userId, currentPassword, newPassword) {
        const user = await userRepository.findById(userId);
        if (!user) {
            const error = new Error('User not found');
            error.statusCode = 404;
            throw error;
        }

        // Verify current password
        const isValid = await comparePassword(currentPassword, user.passwordHash);
        if (!isValid) {
            const error = new Error('Current password is incorrect');
            error.statusCode = 400;
            throw error;
        }

        // Ensure new password is different
        const isSame = await comparePassword(newPassword, user.passwordHash);
        if (isSame) {
            const error = new Error('New password must be different from the current password');
            error.statusCode = 400;
            throw error;
        }

        const newHash = await hashPassword(newPassword);
        await userRepository.update(userId, { passwordHash: newHash });

        return { message: 'Password changed successfully' };
    }

    /**
     * Remove profile image (set to null) and delete the old file if it's a local upload
     * @param {number} userId - Authenticated user ID
     * @returns {Promise<object>} Updated user without password
     */
    async removeProfileImage(userId) {
        const user = await userRepository.findById(userId);
        if (!user) {
            const error = new Error('User not found');
            error.statusCode = 404;
            throw error;
        }

        // Delete old file if stored locally
        if (user.profileImageUrl) {
            try {
                const filename = path.basename(user.profileImageUrl);
                const filePath = path.join(process.cwd(), 'uploads', 'profiles', filename);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            } catch (err) {
                console.error('Could not delete old profile image:', err.message);
            }
        }

        const updated = await userRepository.update(userId, { profileImageUrl: null });
        const { passwordHash: _, ...userWithoutPassword } = updated.toJSON();
        return userWithoutPassword;
    }
}

module.exports = new AuthService();
