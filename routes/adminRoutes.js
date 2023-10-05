import express from 'express';
const router = express.Router();
import checkUserAuth from '../middlewares/auth-middleware.js';
import AdminController from '../controllers/adminController.js';

//// Protected Routes
router.use('/get-user-list', checkUserAuth)
router.use('/user-delete', checkUserAuth)
router.use('/user-status', checkUserAuth)
router.use('/game', checkUserAuth)





// Protected Routes user
router.get('/get-user-list', AdminController.getUserList)
router.delete('/user-delete', AdminController.deleteUser)
router.patch('/user-status', AdminController.toggleUserStatus)

// Protected Routes game-create
router.post('/game', AdminController.createGame)
router.patch('/game', AdminController.updateGame)
router.delete('/game', AdminController.deleteGame)
router.get('/game', AdminController.getGameList)





export default router