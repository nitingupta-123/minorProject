const { Router } = require('express');
const authController = require('../controllers/authController');
const forgotPasswordController=require('../controllers/forgotPasswordController');
const emailVerificationController = require('../controllers/emailVerificationController');
const router = Router();


/*******************||Email Verification CONTROLLER||********************/

router.get('/verify', emailVerificationController.verify_get);
router.post('/verify', emailVerificationController.verify_post);
router.get('/verify-sucess/:id',emailVerificationController.verifySucess_get);
router.post('/verify-sucess', emailVerificationController.verifySucess_post);

/*******************||Login CONTROLLER||********************/


router.get('/login', authController.login_get);
router.post('/login', authController.login_post);
router.get('/logout', authController.logout_get);



/*******************||FORGOT PASSWORD CONTROLLER||********************/


router.get('/forgot-password', forgotPasswordController.forgotPassword_get);
router.put('/forgot-password',forgotPasswordController.forgotPassword_put);
router.put('/reset-password/:id',forgotPasswordController.resetPassword_put);
router.get('/reset-password/:id',forgotPasswordController.resetPassword_get);


module.exports = router;