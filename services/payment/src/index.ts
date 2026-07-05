import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import Razorpay from "razorpay";
import paymentRouter from "./routes/payment.js";

dotenv.config();

export const instance = new Razorpay({
   key_id : process.env.RAZORPAY_ID,
   key_secret : process.env.RAZORPAY_SECRET_KEY
})

const app = express();

app.use(cors({
    origin : "*"
}));
app.use(express.json());
app.use('/api/payment', paymentRouter);


app.listen(process.env.PORT, () => {
    console.log(`Payment service running on port ${process.env.PORT}`);
})

