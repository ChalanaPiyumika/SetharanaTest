const authService = require('../../application/services/auth.service');
const { setAuthCookies, clearAuthCookies } = require('../../shared/utils/cookie.util');

/**
 * Authentication Controller
 * Handles HTTP requests for authentication endpoints
 */

class AuthController {
    /**
     * Register new user
     * POST /api/v1/auth/register
     */
    async register(req, res, next) {
        try {
            const user = await authService.registerUser(req.body);

            res.status(201).json({
                success: true,
                message: 'User registered successfully',
                data: { user }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Login user
     * POST /api/v1/auth/login
     */
    async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const result = await authService.loginUser(email, password);

            // Set HTTP-only cookies for tokens
            setAuthCookies(res, result.accessToken, result.refreshToken);

            // Return user data only (tokens are in cookies)
            res.status(200).json({
                success: true,
                message: 'Login successful',
                data: {
                    user: result.user
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Social login user
     * POST /api/v1/auth/social-login
     */
    async socialLogin(req, res, next) {
        try {
            const { provider, token } = req.body;
            
            if (!provider || !token) {
                return res.status(400).json({
                    success: false,
                    message: 'Provider and token are required'
                });
            }

            const result = await authService.socialLogin(provider, token);

            // Set HTTP-only cookies for tokens
            setAuthCookies(res, result.accessToken, result.refreshToken);

            // Return user data only (tokens are in cookies)
            res.status(200).json({
                success: true,
                message: `${provider} login successful`,
                data: {
                    user: result.user
                }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Refresh access token
     * POST /api/v1/auth/refresh-token
     */
    async refreshToken(req, res, next) {
        try {
            // Get refresh token from cookie
            const refreshToken = req.cookies.refreshToken;

            if (!refreshToken) {
                return res.status(401).json({
                    success: false,
                    message: 'Refresh token is required'
                });
            }

            const result = await authService.refreshToken(refreshToken);

            // Set new access token cookie (refresh token remains the same)
            setAuthCookies(res, result.accessToken, refreshToken);

            res.status(200).json({
                success: true,
                message: 'Token refreshed successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Logout user
     * POST /api/v1/auth/logout
     */
    async logout(req, res, next) {
        try {
            // Get refresh token from cookie
            const refreshToken = req.cookies.refreshToken;

            if (refreshToken) {
                // Validate the refresh token before logout
                await authService.logoutUser(refreshToken);
            }

            // Clear authentication cookies
            clearAuthCookies(res);

            res.status(200).json({
                success: true,
                message: 'Logged out successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Forgot password
     * POST /api/v1/auth/forgot-password
     */
    async forgotPassword(req, res, next) {
        try {
            const { email } = req.body;
            const result = await authService.forgotPassword(email);

            res.status(200).json({
                success: true,
                message: result.message
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Verify OTP
     * POST /api/v1/auth/verify-otp
     */
    async verifyOtp(req, res, next) {
        try {
            const { email, otp } = req.body;
            const result = await authService.verifyOtp(email, otp);

            res.status(200).json({
                success: true,
                message: result.message
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Reset Password using OTP
     * POST /api/v1/auth/reset-password
     */
    async resetPassword(req, res, next) {
        try {
            const { email, otp, newPassword } = req.body;
            const result = await authService.resetPassword(email, otp, newPassword);

            res.status(200).json({
                success: true,
                message: result.message
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get current authenticated user (full profile from DB)
     * GET /api/v1/auth/me
     */
    async getMe(req, res, next) {
        try {
            const userId = req.user.id;
            const user = await authService.getFullProfile(userId);
            res.status(200).json({
                success: true,
                data: { user }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Update user profile
     * PUT /api/v1/auth/profile
     */
    async updateProfile(req, res, next) {
        try {
            const userId = req.user.id;
            const updatedUser = await authService.updateProfile(userId, req.body);

            res.status(200).json({
                success: true,
                message: 'Profile updated successfully',
                data: { user: updatedUser }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Upload profile image
     * POST /api/v1/auth/profile/image
     */
    async uploadProfileImage(req, res, next) {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'No image file provided'
                });
            }

            const userId = req.user.id;
            // Get the secure Cloudinary URL provided by multer-storage-cloudinary
            const profileImageUrl = req.file.path;

            const updatedUser = await authService.updateProfile(userId, { profileImageUrl });

            res.status(200).json({
                success: true,
                message: 'Profile image uploaded successfully',
                data: { user: updatedUser, profileImageUrl }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Remove profile image
     * DELETE /api/v1/auth/profile/image
     */
    async removeProfileImage(req, res, next) {
        try {
            const userId = req.user.id;
            const updatedUser = await authService.removeProfileImage(userId);

            res.status(200).json({
                success: true,
                message: 'Profile image removed successfully',
                data: { user: updatedUser }
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Change password
     * POST /api/v1/auth/change-password
     */
    async changePassword(req, res, next) {
        try {
            const userId = req.user.id;
            const { currentPassword, newPassword } = req.body;

            if (!currentPassword || !newPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'currentPassword and newPassword are required'
                });
            }

            const result = await authService.changePassword(userId, currentPassword, newPassword);

            res.status(200).json({
                success: true,
                message: result.message
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new AuthController();
