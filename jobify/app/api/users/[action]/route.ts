import { NextRequest, NextResponse } from "next/server";
import { User, UserProfile, Subscription, SavedItem, ActivityLog, EmailTemplate, Job, Recruiter } from "@/lib/models/index";
import { encrypt } from "@/lib/utils/encryption";
import connectDB from "@/lib/db";
import { requireAuth, requireRole, handleAuthError } from "@/lib/utils/auth-server";

const json = (data: any, status = 200) => NextResponse.json(data, { status });

export async function GET(req: NextRequest, { params }: { params: Promise<{ action: string }> }) {
  await connectDB();
  const { action } = await params;

  try {
    const user = requireAuth(req);
    
    switch (action) {
      case "me":
        return await getMe(user.userId);
      case "saved-items":
        requireRole(req, "seeker");
        return await getSavedItems(req, user.userId);
      case "activity":
        return await getActivityTimeline(req, user.userId);
      default:
        return json({ error: "Invalid action" }, 404);
    }
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN") return handleAuthError(error);
    console.error(`Users GET [${action}] error:`, error);
    return json({ error: "Internal server error" }, 500);
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ action: string }> }) {
  await connectDB();
  const { action } = await params;

  try {
    const user = requireAuth(req);

    if (action === "upload-resume") {
      requireRole(req, "seeker");
      const formData = await req.formData().catch(() => null);
      return await uploadResume(user.userId, formData);
    }

    const body = await req.json().catch(() => ({}));
    switch (action) {
      case "onboarding":
        requireRole(req, "seeker");
        return await completeOnboarding(user.userId, body);
      case "saved-items":
        requireRole(req, "seeker");
        return await saveItem(user.userId, body);
      default:
        return json({ error: "Invalid action" }, 404);
    }
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN") return handleAuthError(error);
    console.error(`Users POST [${action}] error:`, error);
    return json({ error: "Internal server error" }, 500);
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ action: string }> }) {
  await connectDB();
  const { action } = await params;

  try {
    const user = requireAuth(req);
    const body = await req.json().catch(() => ({}));
    
    switch (action) {
      case "profile":
      case "profile-gmail":
        requireRole(req, "seeker");
        return await updateProfile(user.userId, body);
      default:
        return json({ error: "Invalid action" }, 404);
    }
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN") return handleAuthError(error);
    console.error(`Users PUT [${action}] error:`, error);
    return json({ error: "Internal server error" }, 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ action: string }> }) {
  await connectDB();
  const { action } = await params;

  try {
    const user = requireAuth(req);
    
    if (action.startsWith("saved-items-")) {
      requireRole(req, "seeker");
      const itemId = action.replace("saved-items-", "");
      return await unsaveItem(user.userId, itemId);
    }

    return json({ error: "Invalid action" }, 404);
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN") return handleAuthError(error);
    console.error(`Users DELETE [${action}] error:`, error);
    return json({ error: "Internal server error" }, 500);
  }
}

async function getMe(userId: string) {
  const user = await User.findById(userId).select("-passwordHash");
  if (!user) return json({ error: "User not found" }, 404);

  const profile = await UserProfile.findOne({ userId: user._id });
  const subscription = await Subscription.findOne({ userId: user._id, status: "active", endDate: { $gte: new Date() } });

  return json({
    user: { id: user._id, email: user.email, role: user.role, createdAt: user.createdAt },
    profile: profile || null,
    isSubscribed: !!subscription,
    subscription: subscription ? { planName: subscription.planName, endDate: subscription.endDate } : null,
  });
}

async function completeOnboarding(userId: string, body: any) {
  const { name, phone, skills, experience, projects, education, gmailId, gmailAppPassword } = body;
  let profile = await UserProfile.findOne({ userId });
  const encryptedPassword = gmailAppPassword ? encrypt(gmailAppPassword) : undefined;

  if (!profile) {
    profile = await UserProfile.create({
      userId, name, phone, skills: skills || [], experience, projects, education,
      gmailId, gmailAppPassword: encryptedPassword, onboardingCompleted: true,
    });
  } else {
    if (name) profile.name = name;
    if (phone) profile.phone = phone;
    if (skills) profile.skills = skills;
    if (experience) profile.experience = experience;
    if (projects) profile.projects = projects;
    if (education) profile.education = education;
    if (gmailId) profile.gmailId = gmailId;
    if (gmailAppPassword) profile.gmailAppPassword = encryptedPassword!;
    profile.onboardingCompleted = true;
    await profile.save();
  }

  const defaultTemplate = await EmailTemplate.findOne({ userId, isDefault: true });
  if (!defaultTemplate) {
    await EmailTemplate.create({ userId, name: "Default Template", isDefault: true });
  }

  await ActivityLog.create({
    userId, action: "Completed onboarding", actionType: "profile_updated", details: { skills: skills?.length || 0 },
  });

  return json({ message: "Onboarding completed successfully", profile });
}

async function updateProfile(userId: string, body: any) {
  const { name, phone, skills, experience, projects, education, gmailId, gmailAppPassword, resumeUrl } = body;
  const profile = await UserProfile.findOne({ userId });
  if (!profile) return json({ error: "Profile not found" }, 404);

  if (name !== undefined) profile.name = name;
  if (phone !== undefined) profile.phone = phone;
  if (skills !== undefined) profile.skills = skills;
  if (experience !== undefined) profile.experience = experience;
  if (projects !== undefined) profile.projects = projects;
  if (education !== undefined) profile.education = education;
  if (gmailId !== undefined) profile.gmailId = gmailId;
  if (gmailAppPassword !== undefined) profile.gmailAppPassword = encrypt(gmailAppPassword);
  if (resumeUrl !== undefined) profile.resumeUrl = resumeUrl;

  await profile.save();

  await ActivityLog.create({ userId, action: "Updated profile", actionType: "profile_updated", details: {} });

  return json({ message: "Profile updated successfully", profile });
}

import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

async function uploadResume(userId: string, formData: FormData | null) {
  if (!formData) return json({ error: "Invalid form data" }, 400);
  
  const file = formData.get("resume") as File | null;
  if (!file) return json({ error: "No file uploaded" }, 400);

  const allowedTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
  if (!allowedTypes.includes(file.type)) {
    return json({ error: "Only PDF, DOC, and DOCX files are allowed" }, 400);
  }

  const profile = await UserProfile.findOne({ userId });
  if (!profile) return json({ error: "Profile not found" }, 404);

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
  const ext = file.name.substring(file.name.lastIndexOf('.'));
  const filename = `${uniqueSuffix}${ext}`;
  
  const uploadDir = join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });
  
  const path = join(uploadDir, filename);
  await writeFile(path, buffer);

  const resumeUrl = `/uploads/${filename}`;
  profile.resumeUrl = resumeUrl;
  await profile.save();

  return json({ message: "Resume uploaded successfully", resumeUrl });
}

async function getSavedItems(req: NextRequest, userId: string) {
  const url = new URL(req.url);
  const type = url.searchParams.get("type");
  
  const query: any = { userId };
  if (type) query.itemType = type;

  const savedItems = await SavedItem.find(query).sort({ createdAt: -1 });

  const populatedItems = await Promise.all(
    savedItems.map(async (item) => {
      let itemData;
      if (item.itemType === "job") {
        itemData = await Job.findById(item.itemId).populate("recruiterId", "companyName");
      } else {
        itemData = await Recruiter.findById(item.itemId);
      }
      return { ...item.toObject(), item: itemData };
    })
  );

  return json({ savedItems: populatedItems });
}

async function saveItem(userId: string, body: any) {
  const { itemType, itemId, notes } = body;
  if (!itemType || !itemId) return json({ error: "Item type and ID are required" }, 400);

  const existing = await SavedItem.findOne({ userId, itemId });
  if (existing) return json({ error: "Item already saved" }, 400);

  const savedItem = await SavedItem.create({ userId, itemType, itemId, notes });

  await ActivityLog.create({
    userId, action: `Saved ${itemType}`, actionType: itemType === "job" ? "job_saved" : "recruiter_saved", details: { itemId },
  });

  return json({ message: "Item saved successfully", savedItem }, 201);
}

async function unsaveItem(userId: string, itemId: string) {
  const result = await SavedItem.findOneAndDelete({ userId, itemId });
  if (!result) return json({ error: "Saved item not found" }, 404);
  return json({ message: "Item removed from saved" });
}

async function getActivityTimeline(req: NextRequest, userId: string) {
  const url = new URL(req.url);
  const limit = url.searchParams.get("limit") || "20";

  const activities = await ActivityLog.find({ userId })
    .sort({ timestamp: -1 })
    .limit(Number(limit));

  return json({ activities });
}
