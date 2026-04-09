const { verifyAccessToken } = require('../../shared/utils/jwt.util');

/**
 * Authentication Middleware
 * Verifies JWT access token and attaches user to request
 */

const authenticate = (req, res, next) => {
    try {
        let token;

        // Primary: Try to get token from HTTP-only cookie
        if (req.cookies && req.cookies.accessToken) {
            token = req.cookies.accessToken;
        }
        // Fallback: Try Authorization header (for backward compatibility)
        else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            token = req.headers.authorization.substring(7); // Remove 'Bearer ' prefix
        }

        // No token found
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access token is required'
            });
        }

        // Verify token
        const decoded = verifyAccessToken(token);

        // Attach user to request
        req.user = decoded;

        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid access token'
            });
        }

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Access token has expired'
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Authentication failed'
        });
    }
};

module.exports = authenticate;
