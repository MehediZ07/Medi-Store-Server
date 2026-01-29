import { Router } from 'express';
import * as authController from './auth.controller';
import { authenticate } from '../../middlewares/auth';

const router = Router();

// Public routes
router.post('/register', authController.signup);
router.post('/login', authController.signin);

// Protected routes
router.get('/me', authenticate, authController.getMe);
router.post('/sign-out', authenticate, authController.signout);

export default router;