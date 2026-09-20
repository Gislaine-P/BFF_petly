export const requireRole = (requiredRole) => {
  return (req, res, next) => {
    // Extrae los grupos de Cognito del payload verificado por authenticateToken
    const userGroups = req.user["cognito:groups"] || [];

    if (!userGroups.includes(requiredRole)) {
      return res.status(403).json({ 
        mensaje: `Acceso denegado: Se requiere el rol de ${requiredRole}` 
      });
    }

    next();
  };
};