import { tryCatch } from "../utils/tryCatch.js";
import { AuthenticatedRequest } from "../middlewares/auth.js";
import { ErrorHandler } from "../utils/errorHandler.js";
import { sql } from "../utils/db.js";
import { instance } from "../index.js";
import crypto from 'crypto';

export const checkOut = tryCatch(async(req : AuthenticatedRequest, res, next) => {
  if(!req.user?.user_id){
    return next(new ErrorHandler(401, "Unauthorized"));
  }
  
  const user_id = req.user.user_id;

  const [user] = await sql`SELECT * from users WHERE user_id = ${user_id}`;

  const isSubscribed = user.subscription && new Date(user.subscription).getTime() > Date.now();
  
  if(isSubscribed){
    return next(new ErrorHandler(400, "you already have an active subscription"));
  }

  const options = {
    amount : Number(119 * 100),
    currency : "INR",
    notes : {
        user_id : user_id.toString(),
    }
  };

  const order = await instance.orders.create(options);

  res.status(200).json({
    success : true,
    order
  })
  

})

export const verifyPayment = tryCatch(async(req : AuthenticatedRequest, res, next) => {
    if(!req.user){
        return next(new ErrorHandler(401, "Unauthorized"))
    }

    const {razorpay_order_id, razorpay_payment_id, razorpay_signature} = req.body;

    if(!razorpay_order_id || !razorpay_payment_id || !razorpay_signature){
        return next(new ErrorHandler(400, "Payment verification failed"));
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_SECRET_KEY as string)
    .update(body.toString())
    .digest('hex');

    if(expectedSignature !== razorpay_signature){
        return next(new ErrorHandler(400, "Payment verification failed"))
    }

    const user_id = req.user.user_id;

    const subscriptionEndDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const [updateUser] = await sql`UPDATE users SET subscription = ${subscriptionEndDate} WHERE user_id = ${user_id} RETURNING *`;

    return res.status(200).json({
        success : true,
        message : "Subscription purchased successfully",
        user : updateUser
    })

    
})