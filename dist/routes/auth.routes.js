"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_service_1 = require("../services/auth.service");
const user_repository_1 = require("../repositories/user.repository");
const auth_repository_1 = require("../repositories/auth.repository");
const admin_repository_1 = require("../repositories/admin.repository");
const session_repository_1 = require("../repositories/session.repository");
const login_history_repository_1 = require("../repositories/login-history.repository");
const jwt_service_1 = require("../services/jwt.service");
const email_service_1 = require("../services/email.service");
const otp_service_1 = require("../services/otp.service");
const otp_repository_1 = require("../repositories/otp.repository");
const sms_service_1 = require("../services/sms.service");
const google_service_1 = require("../services/google.service");
const auth_middleware_1 = require("../middleware/auth.middleware");
const auth_validators_1 = require("../validators/auth.validators");
const validators_1 = require("../validators");
// Initialize repositories
const userRepo = new user_repository_1.UserRepository();
const authRepo = new auth_repository_1.AuthRepository();
const adminRepo = new admin_repository_1.AdminRepository();
const sessionRepo = new session_repository_1.SessionRepository();
const loginHistoryRepo = new login_history_repository_1.LoginHistoryRepository();
const otpRepo = new otp_repository_1.OtpRepository();
// Initialize services
const jwtService = new jwt_service_1.JwtService();
const emailService = new email_service_1.EmailService();
const smsService = new sms_service_1.SmsService();
const otpService = new otp_service_1.OtpService(otpRepo, smsService);
const googleService = new google_service_1.GoogleService();
const authService = new auth_service_1.AuthService(userRepo, authRepo, jwtService, emailService, otpService, googleService, sessionRepo, loginHistoryRepo, adminRepo);
// Initialize controller
const authController = new auth_controller_1.AuthController(authService);
const router = (0, express_1.Router)();
// Public routes
router.post('/register', auth_validators_1.registerValidation, validators_1.validateRequest, authController.register);
router.post('/login', auth_validators_1.loginValidation, validators_1.validateRequest, authController.login);
router.post('/google', auth_validators_1.googleLoginValidation, validators_1.validateRequest, authController.googleLogin);
router.post('/otp/request', auth_validators_1.requestOtpValidation, validators_1.validateRequest, authController.requestOtp);
router.post('/otp/verify', auth_validators_1.verifyOtpValidation, validators_1.validateRequest, authController.verifyOtp);
router.post('/refresh-token', auth_validators_1.refreshTokenValidation, validators_1.validateRequest, authController.refreshToken);
router.post('/forgot-password', auth_validators_1.forgotPasswordValidation, validators_1.validateRequest, authController.forgotPassword);
router.post('/reset-password/:token', auth_validators_1.resetPasswordValidation, validators_1.validateRequest, authController.resetPassword);
router.get('/verify-email/:token', authController.verifyEmail);
// Protected routes
router.post('/logout', auth_middleware_1.protect, authController.logout);
router.get('/me', auth_middleware_1.protect, authController.getMe);
router.put('/update-profile', auth_middleware_1.protect, auth_validators_1.updateProfileValidation, validators_1.validateRequest, authController.updateProfile);
router.put('/change-password', auth_middleware_1.protect, auth_validators_1.changePasswordValidation, validators_1.validateRequest, authController.changePassword);
exports.default = router;
