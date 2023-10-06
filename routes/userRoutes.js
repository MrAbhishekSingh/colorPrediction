import express from 'express';
const router = express.Router();
import UserController from '../controllers/userController.js';
import checkUserAuth from '../middlewares/auth-middleware.js';
import AdminController from '../controllers/adminController.js';
import WalletController from '../controllers/walletController.js';

// ROute Level Middleware - To Protect Route
router.use('/change-password', checkUserAuth)
router.use('/user-data', checkUserAuth)
router.use('/game', checkUserAuth)
router.use('/add-fund', checkUserAuth)
router.use('/withdraw-amount', checkUserAuth)
router.use('/withdraw-history', checkUserAuth)


// Public Routes
router.post('/register', UserController.userRegistration)
router.post('/login', UserController.userLogin)
// router.post('/send-reset-password-email', UserController.sendUserPasswordResetEmail)
// router.post('/reset-password/:id/:token', UserController.userPasswordReset)
router.post('/otp-verify', UserController.otpVerify)
router.post('/resend-otp', UserController.resendOtp)
router.post('/forgot-password', UserController.forgotPassword)
router.post('/reset-password', UserController.resetPassword)

// Protected Routes
router.post('/change-password', UserController.changeUserPassword)
router.get('/user-data', UserController.userData)
router.get('/game', AdminController.getGameList)

//wallet route
router.post('/add-fund', WalletController.addAmount)
router.post('/withdraw-amount', WalletController.withdrawAmount)
router.get('/withdraw-history', WalletController.withdrawHistory)




export default router