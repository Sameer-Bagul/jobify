import { NextResponse, NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User, UserProfile, Recruiter, ActivityLog } from "@/lib/models/index";
import { generateOTP } from "@/lib/utils/encryption";
import { sendOTPEmail } from "@/lib/utils/emailService";
import { env } from "@/lib/utils/env";
import connectDB from "@/lib/db";

// Helper to handle standard API responses
const json = (data: any, status = 200) => NextResponse.json(data, { status });

export async function POST(req: NextRequest, { params }: { params: Promise<{ action: string }> }) {
  await connectDB();
  const { action } = await params;
  const body = await req.json().catch(() => ({}));

  try {
    switch (action) {
      case "signup":
        return await signup(body);
      case "login":
        return await login(body, req);
      case "forgot-password":
        return await forgotPassword(body);
      case "verify-otp":
        return await verifyOTP(body);
      case "reset-password":
        return await resetPassword(body);
      case "change-password":
        return await changePassword(body, req);
      default:
        return json({ error: "Invalid action" }, 404);
    }
  } catch (error) {
    console.error(`Auth [${action}] error:`, error);
    return json({ error: "Internal server error" }, 500);
  }
}

async function signup(body: any) {
  const { email, password, role = "seeker", name, companyName } = body;

  if (!email || !password) return json({ error: "Email and password are required" }, 400);
  if (password.length < 6) return json({ error: "Password must be at least 6 characters" }, 400);

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) return json({ error: "User already exists" }, 400);

  const passwordHash = await bcrypt.hash(password, 10);
  const newUser = await User.create({ email: email.toLowerCase(), passwordHash, role });

  if (role === "seeker") {
    await UserProfile.create({ userId: newUser._id, name: name || null });
  } else if (role === "recruiter") {
    await Recruiter.create({
      userId: newUser._id,
      recruiterName: name || "Unnamed Recruiter",
      companyName: companyName || "Company",
      recruiterEmail: email.toLowerCase(),
      isInternal: false,
    });
  }

  const token = jwt.sign({ userId: newUser._id, role: newUser.role }, env.jwtSecret, { expiresIn: "7d" });

  await ActivityLog.create({
    userId: newUser._id,
    action: "User signed up",
    actionType: "login",
    details: { role },
  });

  const response = json({
    message: "User created successfully",
    token,
    user: { id: newUser._id, email: newUser.email, role: newUser.role, onboardingCompleted: false },
  }, 201);
  
  // Set HttpOnly cookie for Edge Middleware
  response.cookies.set('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 604800, path: '/' });
  return response;
}

async function login(body: any, req: NextRequest) {
  const { email, password } = body;

  if (!email || !password) return json({ error: "Email and password are required" }, 400);

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) return json({ error: "Invalid credentials" }, 401);
  if (user.isBanned) return json({ error: "Your account has been suspended. Please contact support." }, 403);
  if (!user.isActive) return json({ error: "Your account is inactive." }, 403);

  const isValidPassword = await bcrypt.compare(password, user.passwordHash);
  if (!isValidPassword) return json({ error: "Invalid credentials" }, 401);

  user.lastLogin = new Date();
  await user.save();

  const token = jwt.sign({ userId: user._id, role: user.role }, env.jwtSecret, { expiresIn: "7d" });

  await ActivityLog.create({
    userId: user._id,
    action: "User logged in",
    actionType: "login",
    details: {},
  });

  let onboardingCompleted = true;
  let userName = undefined;
  if (user.role === "seeker") {
    const profile = await UserProfile.findOne({ userId: user._id });
    onboardingCompleted = profile?.onboardingCompleted ?? false;
    userName = profile?.name;
  } else if (user.role === "recruiter") {
    const recruiter = await Recruiter.findOne({ userId: user._id });
    onboardingCompleted = recruiter?.onboardingCompleted ?? false;
    userName = recruiter?.recruiterName;
  }

  const response = json({
    message: "Login successful",
    token,
    user: { id: user._id, email: user.email, role: user.role, onboardingCompleted, name: userName },
  });
  
  response.cookies.set('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 604800, path: '/' });
  return response;
}

async function forgotPassword(body: any) {
  const { email } = body;
  if (!email) return json({ error: "Email is required" }, 400);

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) return json({ message: "If the email exists, an OTP will be sent." });

  const otp = generateOTP();
  const expiry = new Date(Date.now() + 10 * 60 * 1000);

  user.resetPasswordOTP = otp;
  user.resetPasswordExpiry = expiry;
  await user.save();

  const emailResult = await sendOTPEmail(email, otp);
  if (!emailResult.success) console.error("Failed to send OTP email:", emailResult.error);

  return json({ message: "If the email exists, an OTP will be sent." });
}

async function verifyOTP(body: any) {
  const { email, otp } = body;
  if (!email || !otp) return json({ error: "Email and OTP are required" }, 400);

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) return json({ error: "Invalid OTP" }, 400);
  if (!user.resetPasswordOTP || !user.resetPasswordExpiry) return json({ error: "No OTP request found. Please request a new one." }, 400);

  if (new Date() > user.resetPasswordExpiry) {
    user.resetPasswordOTP = null;
    user.resetPasswordExpiry = null;
    await user.save();
    return json({ error: "OTP has expired. Please request a new one." }, 400);
  }

  if (user.resetPasswordOTP !== otp) return json({ error: "Invalid OTP" }, 400);

  return json({ message: "OTP verified successfully", verified: true });
}

async function resetPassword(body: any) {
  const { email, otp, newPassword } = body;
  if (!email || !otp || !newPassword) return json({ error: "Email, OTP, and new password are required" }, 400);
  if (newPassword.length < 6) return json({ error: "Password must be at least 6 characters" }, 400);

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) return json({ error: "Invalid request" }, 400);
  if (!user.resetPasswordOTP || user.resetPasswordOTP !== otp) return json({ error: "Invalid OTP" }, 400);
  if (user.resetPasswordExpiry && new Date() > user.resetPasswordExpiry) return json({ error: "OTP has expired" }, 400);

  const passwordHash = await bcrypt.hash(newPassword, 10);
  user.passwordHash = passwordHash;
  user.resetPasswordOTP = null;
  user.resetPasswordExpiry = null;
  await user.save();

  return json({ message: "Password reset successfully" });
}

async function changePassword(body: any, req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  let token = req.cookies.get('token')?.value;
  if (!token && authHeader) token = authHeader.split(' ')[1];
  
  if (!token) return json({ error: "Access token required" }, 401);
  
  let userId;
  try {
    const decoded = jwt.verify(token, env.jwtSecret) as any;
    userId = decoded.userId;
  } catch(e) {
    return json({ error: "Invalid or expired token" }, 403);
  }

  const { currentPassword, newPassword } = body;
  if (!currentPassword || !newPassword) return json({ error: "Current and new password are required" }, 400);

  const user = await User.findById(userId);
  if (!user) return json({ error: "User not found" }, 404);

  const isValidPassword = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isValidPassword) return json({ error: "Current password is incorrect" }, 400);

  const passwordHash = await bcrypt.hash(newPassword, 10);
  user.passwordHash = passwordHash;
  await user.save();

  return json({ message: "Password changed successfully" });
}
