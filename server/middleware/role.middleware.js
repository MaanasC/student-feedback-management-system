/**
 * Role-based Authorization Middleware (Experiment 6 requirement)
 * Restricts access to routes based on user role (Student, Faculty, Administrator)
 */
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. Authentication required before role verification.',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden. Role '${req.user.role}' is not authorized to access this resource. Allowed roles: [${allowedRoles.join(', ')}]`,
      });
    }

    next();
  };
};

export default authorizeRoles;
