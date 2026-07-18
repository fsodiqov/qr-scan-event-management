import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { sendSuccess } from '../utils/apiResponse';

export class AuthController {
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.login(req.body, req, res);
      sendSuccess({
        res,
        data: {
          accessToken: result.accessToken,
          user: result.user,
          organization: result.organization,
          role: result.role,
        },
        message: 'Login successful',
      });
    } catch (error) {
      next(error);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.refresh(req, res);
      sendSuccess({
        res,
        data: { accessToken: result.accessToken },
        message: 'Token refreshed',
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await authService.logout(req, res);
      sendSuccess({
        res,
        message: 'Logout successful',
      });
    } catch (error) {
      next(error);
    }
  }

  async logoutAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await authService.logoutAll(req.user!.sub, res);
      sendSuccess({
        res,
        message: 'Logged out from all devices',
      });
    } catch (error) {
      next(error);
    }
  }

  async listSessions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sessions = await authService.listSessions(req.user!.sub, req);
      sendSuccess({ res, data: { sessions } });
    } catch (error) {
      next(error);
    }
  }

  async revokeSession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sessionId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      await authService.revokeSession(req.user!.sub, sessionId, req, res);
      sendSuccess({
        res,
        message: 'Session revoked',
      });
    } catch (error) {
      next(error);
    }
  }

  async me(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const profile = await authService.getProfile(req.user!.sub);
      sendSuccess({ res, data: profile });
    } catch (error) {
      next(error);
    }
  }

  async updateMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await authService.updateProfile(req.user!.sub, req.body);
      sendSuccess({
        res,
        data: { user },
        message: 'Profile updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async uploadMyPhoto(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await authService.uploadMyPhoto(req.user!.sub, req.file);
      sendSuccess({
        res,
        data: { user },
        message: 'Profile photo updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
