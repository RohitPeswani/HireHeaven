import express from "express";
import { isAuthenticated } from "../middlewares/auth.js";
import { checkOut, verifyPayment } from "../controllers/payment.js";

const router = express.Router();

router.post('/check-out', isAuthenticated, checkOut);
router.post('/verify', isAuthenticated, verifyPayment);

export default router;