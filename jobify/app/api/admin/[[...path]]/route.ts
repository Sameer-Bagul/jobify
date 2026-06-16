import { NextRequest, NextResponse } from "next/server";
import { User, UserProfile, Job, Recruiter, ColdEmailLog, Subscription, AdminSettings, DEFAULT_SETTINGS } from "@/lib/models/index";
import { requireAuth, requireRole, handleAuthError } from "@/lib/utils/auth-server";
import { parse } from "csv-parse/sync";
import connectDB from "@/lib/db";

const json = (data: any, status = 200) => NextResponse.json(data, { status });

export async function GET(req: NextRequest, { params }: { params: Promise<{ path?: string[] }> }) {
  await connectDB();
  try {
    const user = requireAuth(req);
    requireRole(req, "admin");
    const { path: routePath } = await params;
    const action = routePath ? routePath[0] : "";

    switch (action) {
      case "dashboard": return await getDashboardStats();
      case "users": return await getAllUsers(req);
      case "jobs": return await getAdminJobs(req);
      case "email-logs": return await getAllEmailLogs(req);
      case "recruiters": return await getInternalRecruiters();
      case "settings": return await getSettings();
      default: return json({ error: "Not found" }, 404);
    }
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN") return handleAuthError(error);
    console.error("Admin GET error:", error);
    return json({ error: "Internal server error" }, 500);
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ path?: string[] }> }) {
  await connectDB();
  try {
    const user = requireAuth(req);
    requireRole(req, "admin");
    const { path: routePath } = await params;
    
    if (routePath && routePath[0] === "users" && routePath[2] === "ban") {
      const body = await req.json().catch(() => ({}));
      return await banUser(routePath[1], body);
    }

    if (routePath && routePath[0] === "recruiters") {
      if (routePath[1] === "upload-csv") {
        const formData = await req.formData().catch(() => null);
        return await uploadRecruitersCSV(user.userId, formData);
      }
      const body = await req.json().catch(() => ({}));
      return await addInternalRecruiter(user.userId, body);
    }

    return json({ error: "Not found" }, 404);
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN") return handleAuthError(error);
    console.error("Admin POST error:", error);
    return json({ error: "Internal server error" }, 500);
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ path?: string[] }> }) {
  await connectDB();
  try {
    const user = requireAuth(req);
    requireRole(req, "admin");
    const { path: routePath } = await params;
    const body = await req.json().catch(() => ({}));

    if (routePath && routePath[0] === "recruiters" && routePath[1]) {
      return await updateInternalRecruiter(routePath[1], body);
    }
    
    if (routePath && routePath[0] === "settings") {
      return await updateSettings(user.userId, body);
    }

    return json({ error: "Not found" }, 404);
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN") return handleAuthError(error);
    console.error("Admin PUT error:", error);
    return json({ error: "Internal server error" }, 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ path?: string[] }> }) {
  await connectDB();
  try {
    const user = requireAuth(req);
    requireRole(req, "admin");
    const { path: routePath } = await params;

    if (routePath && routePath[0] === "users" && routePath[1]) {
      return await deleteUser(routePath[1]);
    }

    if (routePath && routePath[0] === "recruiters" && routePath[1]) {
      return await deleteInternalRecruiter(routePath[1]);
    }

    return json({ error: "Not found" }, 404);
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN") return handleAuthError(error);
    console.error("Admin DELETE error:", error);
    return json({ error: "Internal server error" }, 500);
  }
}

async function getDashboardStats() {
  const totalUsers = await User.countDocuments();
  const totalSeekers = await User.countDocuments({ role: "seeker" });
  const totalRecruiters = await User.countDocuments({ role: "recruiter" });
  const totalJobs = await Job.countDocuments();
  const activeJobs = await Job.countDocuments({ isActive: true });
  const totalEmailsSent = await ColdEmailLog.countDocuments({ status: "sent" });
  const activeSubscriptions = await Subscription.countDocuments({ status: "active" });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const emailsSentToday = await ColdEmailLog.countDocuments({ status: "sent", timestamp: { $gte: today } });
  const newUsersToday = await User.countDocuments({ createdAt: { $gte: today } });

  return json({
    stats: { totalUsers, totalSeekers, totalRecruiters, totalJobs, activeJobs, totalEmailsSent, emailsSentToday, activeSubscriptions, newUsersToday },
  });
}

async function getAllUsers(req: NextRequest) {
  const url = new URL(req.url);
  const page = url.searchParams.get("page") || "1";
  const limit = url.searchParams.get("limit") || "20";
  const role = url.searchParams.get("role");
  const search = url.searchParams.get("search");

  const skip = (Number(page) - 1) * Number(limit);
  const query: any = {};
  if (role) query.role = role;
  if (search) query.email = { $regex: search, $options: "i" };

  const users = await User.find(query).select("-passwordHash").skip(skip).limit(Number(limit)).sort({ createdAt: -1 });
  const total = await User.countDocuments(query);

  return json({ users, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) } });
}

async function banUser(userId: string, body: any) {
  const { banned } = body;
  const user = await User.findById(userId);
  if (!user) return json({ error: "User not found" }, 404);
  if (user.role === "admin") return json({ error: "Cannot ban admin users" }, 400);

  user.isBanned = banned;
  await user.save();

  return json({ message: banned ? "User banned successfully" : "User unbanned successfully", user: { id: user._id, email: user.email, isBanned: user.isBanned } });
}

async function deleteUser(userId: string) {
  const user = await User.findById(userId);
  if (!user) return json({ error: "User not found" }, 404);
  if (user.role === "admin") return json({ error: "Cannot delete admin users" }, 400);

  await UserProfile.deleteOne({ userId });
  await Recruiter.deleteOne({ userId });
  await ColdEmailLog.deleteMany({ userId });
  await Subscription.deleteMany({ userId });
  await User.deleteOne({ _id: userId });

  return json({ message: "User deleted successfully" });
}

async function getAdminJobs(req: NextRequest) {
  const url = new URL(req.url);
  const page = url.searchParams.get("page") || "1";
  const limit = url.searchParams.get("limit") || "20";
  const skip = (Number(page) - 1) * Number(limit);

  const jobs = await Job.find().populate("recruiterId", "companyName recruiterName").skip(skip).limit(Number(limit)).sort({ createdAt: -1 });
  const total = await Job.countDocuments();

  return json({ jobs, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) } });
}

async function getAllEmailLogs(req: NextRequest) {
  const url = new URL(req.url);
  const page = url.searchParams.get("page") || "1";
  const limit = url.searchParams.get("limit") || "50";
  const status = url.searchParams.get("status");
  const date = url.searchParams.get("date");
  const skip = (Number(page) - 1) * Number(limit);

  const query: any = {};
  if (status) query.status = status;
  if (date) {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);
    query.timestamp = { $gte: startDate, $lte: endDate };
  }

  const logs = await ColdEmailLog.find(query).populate("userId", "email").skip(skip).limit(Number(limit)).sort({ timestamp: -1 });
  const total = await ColdEmailLog.countDocuments(query);

  return json({ logs, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) } });
}

async function getInternalRecruiters() {
  const recruiters = await Recruiter.find({ isInternal: true }).sort({ createdAt: -1 });
  return json({ recruiters });
}

async function addInternalRecruiter(adminId: string, body: any) {
  const { recruiterName, recruiterEmail, companyName, phone, linkedinUrl, industry, location, notes } = body;
  if (!recruiterName || !recruiterEmail || !companyName) return json({ error: "Name, email, and company are required" }, 400);

  const recruiter = await Recruiter.create({
    recruiterName, recruiterEmail, companyName, phone, linkedinUrl, industry, location, notes, isInternal: true, addedBy: adminId,
  });
  return json({ message: "Recruiter added successfully", recruiter }, 201);
}

async function updateInternalRecruiter(id: string, updates: any) {
  const recruiter = await Recruiter.findOneAndUpdate({ _id: id, isInternal: true }, updates, { new: true });
  if (!recruiter) return json({ error: "Recruiter not found" }, 404);
  return json({ message: "Recruiter updated successfully", recruiter });
}

async function deleteInternalRecruiter(id: string) {
  const recruiter = await Recruiter.findOneAndDelete({ _id: id, isInternal: true });
  if (!recruiter) return json({ error: "Recruiter not found" }, 404);
  return json({ message: "Recruiter deleted successfully" });
}

async function getSettings() {
  let settings = await AdminSettings.find();
  if (settings.length === 0) {
    const defaultSettings = Object.values(DEFAULT_SETTINGS);
    settings = await AdminSettings.insertMany(defaultSettings);
  }
  const settingsMap: Record<string, any> = {};
  settings.forEach((s) => { settingsMap[s.key] = s.value; });
  return json({ settings: settingsMap });
}

async function updateSettings(adminId: string, body: any) {
  const { key, value } = body;
  if (!key) return json({ error: "Setting key is required" }, 400);

  const setting = await AdminSettings.findOneAndUpdate(
    { key }, { value, updatedBy: adminId }, { new: true, upsert: true }
  );
  return json({ message: "Setting updated successfully", setting });
}

async function uploadRecruitersCSV(adminId: string, formData: FormData | null) {
  if (!formData) return json({ error: "CSV file is required" }, 400);
  
  const file = formData.get("file") as File | null;
  if (!file) return json({ error: "CSV file is required" }, 400);

  const bytes = await file.arrayBuffer();
  const csvContent = Buffer.from(bytes).toString("utf-8");

  let records;
  try {
    records = parse(csvContent, { columns: true, skip_empty_lines: true, trim: true });
  } catch (parseError) {
    return json({ error: "Invalid CSV format" }, 400);
  }

  if (!records || records.length === 0) return json({ error: "CSV file is empty" }, 400);

  const results = { total: records.length, success: 0, failed: 0, errors: [] as string[] };

  for (let i = 0; i < records.length; i++) {
    const row = records[i] as Record<string, string>;
    const rowNum = i + 2;

    const recruiterEmail = row.recruiterEmail || row.email || row.Email || row.recruiter_email;
    const recruiterName = row.recruiterName || row.name || row.Name || row.recruiter_name;
    const companyName = row.companyName || row.company || row.Company || row.company_name;

    if (!recruiterEmail) {
      results.failed++;
      results.errors.push(`Row ${rowNum}: Email is required`);
      continue;
    }

    const existing = await Recruiter.findOne({ recruiterEmail });
    if (existing) {
      results.failed++;
      results.errors.push(`Row ${rowNum}: Email ${recruiterEmail} already exists`);
      continue;
    }

    try {
      const newRecruiter = new Recruiter({
        recruiterEmail, recruiterName: recruiterName || null, companyName: companyName || null,
        phone: row.phone || row.Phone || null, linkedinUrl: row.linkedinUrl || row.linkedin || row.LinkedIn || null,
        industry: row.industry || row.Industry || null, location: row.location || row.Location || null,
        notes: row.notes || row.Notes || null, isInternal: true, addedBy: adminId,
      });
      await newRecruiter.save();
      results.success++;
    } catch (err) {
      results.failed++;
      results.errors.push(`Row ${rowNum}: Failed to create recruiter`);
    }
  }

  return json({ message: `Imported ${results.success} recruiters successfully`, results });
}
