import express from 'express';

// eslint-disable-next-line import/extensions
import { authUser, registerUser } from './auth.controller.js';

const router = express.Router();

router.route('/login').post(authUser);
router.route('/register').post(registerUser);

export default router;
