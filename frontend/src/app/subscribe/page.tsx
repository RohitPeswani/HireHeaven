"use client";

import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { RootState } from "@/store/store";
import { setUser } from "@/store/authSlice";
import { loadRazorpayScript } from "@/components/scriptLoader";
import { HugeiconsIcon } from "@hugeicons/react";
import { LicenseIcon, Tick01Icon, InformationCircleIcon } from "@hugeicons/core-free-icons";
import { Loader } from "@/components/loader";
import { toast } from "react-toastify";

const PAYMENT_API_BASE = process.env.NEXT_PUBLIC_PAYMENT_SERVICE_URL || "http://localhost:5004";

export default function SubscribePage() {
    const { user, token, isAuthenticated } = useSelector((state: RootState) => state.auth);
    const router = useRouter();
    const dispatch = useDispatch();

    const [isPageLoading, setIsPageLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        // If not authenticated, redirect to login
        if (!isAuthenticated || !token) {
            toast.error("Please log in to view this page");
            router.push("/login");
        } else {
            setIsPageLoading(false);
        }
    }, [isAuthenticated, token, router]);

    const handleSubscribe = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);

        try {
            // 1. Create Razorpay order by calling payment backend /checkout
            const checkoutRes = await fetch(`${PAYMENT_API_BASE}/api/payment/check-out`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            const checkoutData = await checkoutRes.json();
            if (!checkoutRes.ok || !checkoutData.success) {
                throw new Error(checkoutData.message || "Failed to initiate payment");
            }

            const { order } = checkoutData;

            // 2. Load Razorpay Script
            const scriptLoaded = await loadRazorpayScript();
            if (!scriptLoaded) {
                throw new Error("Failed to load Razorpay SDK. Please check your internet connection.");
            }

            // 3. Open Razorpay checkout options
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_ID || "rzp_test_T8HM0NXVA1GsuG",
                amount: order.amount,
                currency: order.currency,
                name: "HireHeaven",
                description: "Premium Subscription",
                order_id: order.id,
                prefill: {
                    name: user?.name || "",
                    email: user?.email || "",
                    contact: user?.phone_number || "",
                },
                theme: {
                    color: "#2563eb", // blue-600
                },
                handler: async function (response: any) {
                    try {
                        setIsSubmitting(true);
                        // 4. Verify payment
                        const verifyRes = await fetch(`${PAYMENT_API_BASE}/api/payment/verify`, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${token}`,
                            },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                            }),
                        });

                        const verifyData = await verifyRes.json();
                        console.log("verifyData", verifyData);


                        if (!verifyRes.ok || !verifyData.success) {
                            throw new Error(verifyData.message || "Payment verification failed");
                        }

                        // 5. Update user info in redux store with new subscription
                        const updatedUser = {
                            ...user!,
                            subscription: verifyData.user.subscription,
                        };
                        dispatch(setUser({ user: updatedUser, token: token! }));

                        // 6. Redirect to Success Page
                        toast.success("Subscription Purchased Successfully");
                        router.push(`/payment/success/${response.razorpay_payment_id}`);
                    } catch (verifyError: any) {
                        console.error(verifyError);
                        toast.error(verifyError.message || "Payment verification failed");
                    } finally {
                        setIsSubmitting(false);
                    }
                },
                modal: {
                    ondismiss: function () {
                        setIsSubmitting(false);
                        toast.info("Payment cancelled");
                    },
                },
            };

            const razorpayInstance = new (window as any).Razorpay(options);
            razorpayInstance.open();
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || "An error occurred during subscription process");
            setIsSubmitting(false);
        }
    };

    if (isPageLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader size={40} text="Loading subscription details..." />
            </div>
        );
    }

    // If user is a recruiter, show a friendly warning since subscriptions are seeker-only
    if (user?.role === "recruiter") {
        return (
            <div className="flex items-center justify-center min-h-[70vh] px-4">
                <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-xl dark:shadow-none p-8 text-center space-y-6">
                    <div className="bg-amber-50 dark:bg-amber-950/20 text-amber-500 dark:text-amber-400 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto">
                        <HugeiconsIcon icon={InformationCircleIcon} size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Jobseekers Only</h2>
                    <p className="text-gray-500 dark:text-slate-400 text-sm leading-relaxed">
                        Premium Subscriptions are currently only available for Jobseekers looking to boost their job search and application priority.
                    </p>
                    <button
                        onClick={() => router.push("/profile")}
                        className="w-full bg-[#0f172a] dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 hover:bg-[#1e293b] text-white py-3 rounded-xl font-semibold transition-all shadow-md"
                    >
                        Go to Profile
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-[85vh] bg-[#f8fafc] dark:bg-slate-950 px-4 py-12">
            <div className="max-w-sm w-full bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-xl dark:shadow-none p-8 sm:p-10 space-y-8 flex flex-col justify-between min-h-[500px]">
                <div className="space-y-6">
                    {/* Header Icon */}
                    <div className="bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto shadow-sm">
                        <HugeiconsIcon icon={LicenseIcon} size={28} />
                    </div>

                    {/* Heading */}
                    <div className="text-center space-y-2">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Premium Subscription</h1>
                        <p className="text-sm text-gray-500 dark:text-slate-400 font-medium">Boost your job search</p>
                    </div>

                    {/* Pricing */}
                    <div className="text-center">
                        <div className="text-5xl font-extrabold text-blue-600 tracking-tight">
                            ₹ 119
                        </div>
                        <div className="text-sm font-semibold text-gray-400 dark:text-slate-500 mt-2">
                            Per month
                        </div>
                    </div>

                    {/* Benefits */}
                    <div className="space-y-4 pt-2">
                        <div className="flex items-start gap-3">
                            <HugeiconsIcon icon={Tick01Icon} size={20} className="text-green-500 shrink-0 mt-0.5" />
                            <span className="text-sm text-gray-600 dark:text-slate-300 font-medium leading-relaxed">
                                Your application will be shown first to recruiters
                            </span>
                        </div>
                        <div className="flex items-start gap-3">
                            <HugeiconsIcon icon={Tick01Icon} size={20} className="text-green-500 shrink-0 mt-0.5" />
                            <span className="text-sm text-gray-600 dark:text-slate-300 font-medium leading-relaxed">
                                Priority support
                            </span>
                        </div>
                    </div>
                </div>

                {/* Subscribe Button */}
                <button
                    onClick={handleSubscribe}
                    disabled={isSubmitting}
                    className="w-full bg-[#0f172a] dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 hover:bg-[#1e293b] disabled:bg-[#0f172a]/70 dark:disabled:bg-slate-200 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? (
                        <Loader size={20} className="text-white" text="Processing..." />
                    ) : (
                        <>
                            <HugeiconsIcon icon={LicenseIcon} size={20} />
                            <span>Subscribe Now</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}