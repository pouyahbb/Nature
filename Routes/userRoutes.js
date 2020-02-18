const express = require('express')
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/signup', authController.signup)
router.post('/login', authController.login);

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

router.patch('/updateMyPassword', authController.protect, authController.updatePassword);
router.patch('/updateMe' , authController.protect , userController.updateMe);
router.delete('/deleteMe' , authController.protect , userController.deletMe);

router.route('/')
    .get(userController.getAllUsers)
    .post(userController.CreateUser);

router.route("/:id")
    .get(userController.getUsers) 
    .patch(userController.updateUsers)
    .delete(userController.deleteUser);


module.exports = router;