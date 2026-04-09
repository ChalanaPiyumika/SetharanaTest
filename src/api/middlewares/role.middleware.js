/**
 * Role-based Authorization Middleware
 * Restricts access based on user role
 */

/**
 * Check if user has required role
 * @param  {...string} allowedRoles - Roles that are allowed to access the route
 * @returns {Function} Express middleware
 */
const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        // Check if user is authenticated (should be set by auth middleware)
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        // Check if user's role is in allowed roles
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to access this resource'
            });
        }

        next();
    };
};

module.exports = authorize;
