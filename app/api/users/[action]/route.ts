import { NextRequest, NextResponse } from "next/server";
import { User, UserProfile, Subscription, SavedItem, ActivityLog, EmailTemplate, Job, Recruiter } from "@/lib/models/index";
import { encrypt } from "@/lib/utils/encryption";
import connectDB from "@/lib/db";
import { requireAuth, requireRole, handleAuthError } from "@/lib/utils/auth-server";
import { put } from '@vercel/blob';
import { parseResumeBuffer } from '@/lib/utils/resumeParser';
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

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
    user: { id: user._id, email: user.email, role: user.role, createdAt: user.createdAt, name: profile?.name || user.name },
    profile: profile || null,
    isSubscribed: !!subscription,
    subscription: subscription ? { planName: subscription.planName, endDate: subscription.endDate } : null,
  });
}

async function completeOnboarding(userId: string, body: any) {
  const { name, phone, skills, experience, projects, education, gmailId, gmailAppPassword, location, currentJobTitle, linkedinUrl, portfolioUrl } = body;
  let profile = await UserProfile.findOne({ userId });
  const encryptedPassword = gmailAppPassword ? encrypt(gmailAppPassword) : undefined;

  if (!profile) {
    profile = await UserProfile.create({
      userId, name, phone, skills: skills || [], experience, projects, education,
      gmailId, gmailAppPassword: encryptedPassword, onboardingCompleted: true,
      location, currentJobTitle, linkedinUrl, portfolioUrl
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
    if (location !== undefined) profile.location = location;
    if (currentJobTitle !== undefined) profile.currentJobTitle = currentJobTitle;
    if (linkedinUrl !== undefined) profile.linkedinUrl = linkedinUrl;
    if (portfolioUrl !== undefined) profile.portfolioUrl = portfolioUrl;
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
  console.log('--- updateProfile API called ---');
  console.log('Request body:', body);
  const { name, phone, skills, experience, projects, education, gmailId, gmailAppPassword, resumeUrl, location, currentJobTitle, linkedinUrl, portfolioUrl } = body;
  
  const updateData: any = {};
  if (name !== undefined) updateData.name = name;
  if (phone !== undefined) updateData.phone = phone;
  if (skills !== undefined) updateData.skills = skills;
  if (experience !== undefined) updateData.experience = experience;
  if (projects !== undefined) updateData.projects = projects;
  if (education !== undefined) updateData.education = education;
  if (gmailId !== undefined) updateData.gmailId = gmailId;
  if (gmailAppPassword !== undefined) updateData.gmailAppPassword = encrypt(gmailAppPassword);
  if (resumeUrl !== undefined) updateData.resumeUrl = resumeUrl;
  if (location !== undefined) updateData.location = location;
  if (currentJobTitle !== undefined) updateData.currentJobTitle = currentJobTitle;
  if (linkedinUrl !== undefined) updateData.linkedinUrl = linkedinUrl;
  if (portfolioUrl !== undefined) updateData.portfolioUrl = portfolioUrl;
  updateData.updatedAt = new Date();

  const profile = await UserProfile.findOneAndUpdate(
    { userId },
    { $set: updateData },
    { new: true, strict: false }
  );

  if (!profile) return json({ error: "Profile not found" }, 404);

  console.log('Profile saved successfully. Document:', profile.toObject());

  await ActivityLog.create({ userId, action: "Updated profile", actionType: "profile_updated", details: {} });

  return json({ message: "Profile updated successfully", profile });
}

async function uploadResume(userId: string, formData: FormData | null) {
  if (!formData) return json({ error: "Invalid form data" }, 400);
  
  const file = formData.get("resume") as File | null;
  if (!file) return json({ error: "No file uploaded" }, 400);

  const allowedTypes = ["application/pdf"];
  if (!allowedTypes.includes(file.type)) {
    return json({ error: "Only PDF files are supported for parsing" }, 400);
  }

  const profile = await UserProfile.findOne({ userId });
  if (!profile) return json({ error: "Profile not found" }, 404);

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // 1. Upload to Vercel Blob
  const uniqueFilename = `resumes/${userId}-${Date.now()}.pdf`;
  let resumeUrl = "";
  try {
    const blob = await put(uniqueFilename, file, { access: 'public' });
    resumeUrl = blob.url;
  } catch (err) {
    console.warn("Vercel Blob upload failed, falling back to local storage if in dev.", err);
    // Graceful fallback for local development if BLOB_READ_WRITE_TOKEN is not set
    const uploadDir = join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true }).catch(() => {});
    const path = join(uploadDir, `${Date.now()}.pdf`);
    await writeFile(path, buffer);
    resumeUrl = `/uploads/${Date.now()}.pdf`;
  }

  // 2. Parse PDF for skills and experience
  const analysis = await parseResumeBuffer(buffer);

  // 3. Update Profile
  profile.resumeUrl = resumeUrl;
  
  if (analysis.extractedSkills.length > 0) {
    profile.resumeAnalysis = {
      extractedSkills: analysis.extractedSkills,
      experienceSummary: analysis.experienceSummary || "",
      projectsSummary: "",
    };
    // Append extracted skills to main skills array without duplicates
    const allSkills = new Set([...profile.skills, ...analysis.extractedSkills]);
    profile.skills = Array.from(allSkills);
  }

  await profile.save();

  return json({ 
    message: "Resume uploaded and parsed successfully", 
    resumeUrl, 
    analysis: profile.resumeAnalysis 
  });
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
