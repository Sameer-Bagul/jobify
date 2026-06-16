import { NextRequest, NextResponse } from "next/server";
import { Subscription, ActivityLog } from "@/lib/models/index";
import { requireAuth, requireRole, handleAuthError } from "@/lib/utils/auth-server";
import { createOrder, verifyPaymentSignature, getRazorpayKeyId } from "@/lib/utils/razorpay";
import { PLAN_CONFIGS, PlanTier } from "@/lib/models/Subscription";
import connectDB from "@/lib/db";

const json = (data: any, status = 200) => NextResponse.json(data, { status });
const SUBSCRIPTION_CURRENCY = "INR";

export async function GET(req: NextRequest, { params }: { params: Promise<{ path?: string[] }> }) {
  await connectDB();
  try {
    const { path: routePath } = await params;
    const action = routePath ? routePath[0] : "";

    if (action === "plans") return await getAvailablePlans();

    const user = requireAuth(req);
    requireRole(req, "seeker");

    switch (action) {
      case "status": return await getSubscriptionStatus(user.userId);
      case "history": return await getSubscriptionHistory(user.userId);
      default: return json({ error: "Not found" }, 404);
    }
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN") return handleAuthError(error);
    console.error("Subscription GET error:", error);
    return json({ error: "Internal server error" }, 500);
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ path?: string[] }> }) {
  await connectDB();
  try {
    const user = requireAuth(req);
    requireRole(req, "seeker");
    const { path: routePath } = await params;
    const action = routePath ? routePath[0] : "";
    const body = await req.json().catch(() => ({}));

    switch (action) {
      case "create-order": return await createSubscriptionOrder(user.userId, body);
      case "verify-payment": return await verifySubscriptionPayment(user.userId, body);
      default: return json({ error: "Not found" }, 404);
    }
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN") return handleAuthError(error);
    console.error("Subscription POST error:", error);
    return json({ error: "Internal server error" }, 500);
  }
}

async function getAvailablePlans() {
  const plans = Object.values(PLAN_CONFIGS).map(plan => ({
    tier: plan.tier, name: plan.name, price: plan.price, dailyEmailLimit: plan.dailyEmailLimit, features: plan.features,
  }));
  return json({ plans });
}

async function getSubscriptionStatus(userId: string) {
  const subscription = await Subscription.findOne({
    userId, status: "active", endDate: { $gte: new Date() },
  }).sort({ endDate: -1 });

  if (!subscription) return json({ isSubscribed: false, subscription: null });

  return json({
    isSubscribed: true,
    subscription: {
      planName: subscription.planName, planTier: subscription.planTier, dailyEmailLimit: subscription.dailyEmailLimit,
      amount: subscription.amount, startDate: subscription.startDate, endDate: subscription.endDate,
      daysRemaining: Math.ceil((subscription.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
    },
  });
}

async function getSubscriptionHistory(userId: string) {
  const subscriptions = await Subscription.find({ userId }).sort({ createdAt: -1 }).limit(20);
  return json({ subscriptions });
}

async function createSubscriptionOrder(userId: string, body: any) {
  const { planTier = "pro" } = body;
  if (!["pro", "pro_plus", "pro_max"].includes(planTier)) return json({ error: "Invalid plan tier" }, 400);

  const planConfig = PLAN_CONFIGS[planTier as PlanTier];
  const receipt = `sub_${userId.toString().slice(-8)}_${Date.now()}`;

  const result = await createOrder({
    amount: planConfig.price, currency: SUBSCRIPTION_CURRENCY, receipt,
    notes: { userId: userId.toString(), type: "subscription", planTier },
  });

  if (!result.success || !result.order) return json({ error: result.error || "Failed to create order" }, 500);

  const subscription = await Subscription.create({
    userId, planName: planConfig.name, planTier: planTier as PlanTier, dailyEmailLimit: planConfig.dailyEmailLimit,
    amount: planConfig.price, currency: SUBSCRIPTION_CURRENCY, status: "pending", razorpayOrderId: result.order.id,
  });

  return json({
    orderId: result.order.id, amount: result.order.amount, currency: result.order.currency,
    keyId: getRazorpayKeyId(), subscriptionId: subscription._id, planName: planConfig.name, planTier,
  });
}

async function verifySubscriptionPayment(userId: string, body: any) {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) return json({ error: "Missing payment details" }, 400);

  const isValid = verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
  if (!isValid) {
    const subscription = await Subscription.findOne({ razorpayOrderId: razorpay_order_id });
    if (subscription) {
      subscription.status = "failed";
      await subscription.save();
    }
    return json({ error: "Invalid payment signature" }, 400);
  }

  const subscription = await Subscription.findOne({ razorpayOrderId: razorpay_order_id });
  if (!subscription) return json({ error: "Subscription not found" }, 404);

  const startDate = new Date();
  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + 1);

  subscription.status = "active";
  subscription.razorpayPaymentId = razorpay_payment_id;
  subscription.razorpaySignature = razorpay_signature;
  subscription.startDate = startDate;
  subscription.endDate = endDate;
  await subscription.save();

  await ActivityLog.create({
    userId, action: "Subscription activated", actionType: "subscription_changed",
    details: { planName: subscription.planName, amount: subscription.amount, endDate },
  });

  return json({
    message: "Payment verified and subscription activated",
    subscription: { planName: subscription.planName, startDate: subscription.startDate, endDate: subscription.endDate },
  });
}
