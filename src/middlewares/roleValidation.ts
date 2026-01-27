import { Request, Response, NextFunction } from 'express';

export const validateUserRole = (req: Request, res: Response, next: NextFunction) => {
  const { role } = req.body;
  
  if (role && role.toUpperCase() === 'ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Admin role cannot be assigned during registration. Contact system administrator.',
    });
  }
  
  if (role && !['CUSTOMER', 'SELLER'].includes(role.toUpperCase())) {
    return res.status(400).json({
      success: false,
      message: 'Invalid role. Only CUSTOMER and SELLER roles are allowed.',
    });
  }
  
  next();
};