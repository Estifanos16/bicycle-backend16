exports.authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized, no user found' });
        }

        const userRoles = Array.isArray(req.user.roles) 
            ? req.user.roles 
            : (req.user.role ? [req.user.role] : []);

        const hasPermission = roles.some(allowed => 
            userRoles.includes(allowed) || 
            (allowed === 'supermarket' && userRoles.includes('vendor')) ||
            (allowed === 'vendor' && userRoles.includes('supermarket')) ||
            userRoles.includes('admin')
        );

        if (!hasPermission) {
            return res.status(403).json({ message: 'Access denied: insufficient permissions' });
        }
        next();
    };
};