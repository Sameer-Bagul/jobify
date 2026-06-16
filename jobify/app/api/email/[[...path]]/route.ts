import { NextRequest, NextResponse } from "next/server";
import { UserProfile, ColdEmailLog, EmailTemplate, Subscription, ActivityLog, Recruiter } from "@/lib/models/index";
import { requireAuth, requireRole, handleAuthError } from "@/lib/utils/auth-server";
import { sendEmail, fillTemplate } from "@/lib/utils/emailService";
import { PLAN_CONFIGS, PlanTier, ISubscription } from "@/lib/models/Subscription";
import path from "path";
import connectDB from "@/lib/db";

const json = (data: any, status = 200) => NextResponse.json(data, { status });
const DEFAULT_DAILY_LIMIT = 20;

const getDailyLimitForSubscription = (subscription: ISubscription | null): number => {
  if (!subscription) return 0;
  if (subscription.dailyEmailLimit) return subscription.dailyEmailLimit;
  const planConfig = PLAN_CONFIGS[subscription.planTier as PlanTier];
  return planConfig?.dailyEmailLimit || DEFAULT_DAILY_LIMIT;
};

export async function GET(req: NextRequest, { params }: { params: Promise<{ path?: string[] }> }) {
  await connectDB();
  try {
    const user = requireAuth(req);
    requireRole(req, "seeker");
    const { path: routePath } = await params;
    const action = routePath ? routePath[0] : "";

    switch (action) {
      case "stats": return await getEmailStats(user.userId);
      case "logs": return await getEmailLogs(req, user.userId);
      case "templates": return await getEmailTemplates(user.userId);
      case "recruiters": return await getAvailableRecruiters(req);
      default: return json({ error: "Not found" }, 404);
    }
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN") return handleAuthError(error);
    console.error("Email GET error:", error);
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
      case "send": return await sendColdEmail(user.userId, body);
      case "bulk": return await sendBulkEmails(user.userId, body);
      case "templates": return await createEmailTemplate(user.userId, body);
      default: return json({ error: "Not found" }, 404);
    }
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN") return handleAuthError(error);
    console.error("Email POST error:", error);
    return json({ error: "Internal server error" }, 500);
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ path?: string[] }> }) {
  await connectDB();
  try {
    const user = requireAuth(req);
    requireRole(req, "seeker");
    const { path: routePath } = await params;
    
    if (routePath && routePath[0] === "templates" && routePath[1]) {
      const body = await req.json().catch(() => ({}));
      return await updateEmailTemplate(user.userId, routePath[1], body);
    }
    return json({ error: "Not found" }, 404);
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN") return handleAuthError(error);
    console.error("Email PUT error:", error);
    return json({ error: "Internal server error" }, 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ path?: string[] }> }) {
  await connectDB();
  try {
    const user = requireAuth(req);
    requireRole(req, "seeker");
    const { path: routePath } = await params;

    if (routePath && routePath[0] === "templates" && routePath[1]) {
      return await deleteEmailTemplate(user.userId, routePath[1]);
    }
    return json({ error: "Not found" }, 404);
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN") return handleAuthError(error);
    console.error("Email DELETE error:", error);
    return json({ error: "Internal server error" }, 500);
  }
}

async function getEmailStats(userId: string) {
  const profile = await UserProfile.findOne({ userId });
  if (!profile) return json({ error: "Profile not found" }, 404);

  const subscription = await Subscription.findOne({ userId, status: "active", endDate: { $gte: new Date() } });
  const dailyLimit = getDailyLimitForSubscription(subscription);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (!profile.lastEmailResetDate || new Date(profile.lastEmailResetDate) < today) {
    profile.dailyEmailSentCount = 0;
    profile.lastEmailResetDate = today;
    await profile.save();
  }

  const totalSent = await ColdEmailLog.countDocuments({ userId, status: "sent" });
  const totalFailed = await ColdEmailLog.countDocuments({ userId, status: "failed" });

  return json({
    dailySent: profile.dailyEmailSentCount,
    dailyLimit,
    remaining: Math.max(0, dailyLimit - profile.dailyEmailSentCount),
    totalSent,
    totalFailed,
    hasGmailSetup: !!(profile.gmailId && profile.gmailAppPassword),
    hasResume: !!profile.resumeUrl,
    isSubscribed: !!subscription,
    planName: subscription?.planName || null,
    planTier: subscription?.planTier || null,
  });
}

async function sendColdEmail(userId: string, body: any) {
  const { recruiterEmail, recruiterName, companyName, jobId, jobTitle, subject, body: emailBodyRaw, templateId } = body;
  if (!recruiterEmail) return json({ error: "Recruiter email is required" }, 400);

  const profile = await UserProfile.findOne({ userId });
  if (!profile) return json({ error: "Profile not found" }, 404);
  if (!profile.gmailId || !profile.gmailAppPassword) return json({ error: "Gmail credentials not configured." }, 400);

  const subscription = await Subscription.findOne({ userId, status: "active", endDate: { $gte: new Date() } });
  if (!subscription) return json({ error: "Subscription required", requiresSubscription: true }, 403);

  const dailyLimit = getDailyLimitForSubscription(subscription);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (!profile.lastEmailResetDate || new Date(profile.lastEmailResetDate) < today) {
    profile.dailyEmailSentCount = 0;
    profile.lastEmailResetDate = today;
  }

  if (profile.dailyEmailSentCount >= dailyLimit) {
    return json({ error: `Daily email limit (${dailyLimit}) reached.` }, 429);
  }

  let emailSubject = subject;
  let emailBody = emailBodyRaw;

  if (templateId) {
    const template = await EmailTemplate.findById(templateId);
    if (template) {
      const placeholders = {
        recruiter_name: recruiterName || "Hiring Manager",
        job_role: jobTitle || "the open position",
        company_name: companyName || "your company",
        skills: profile.skills?.join(", ") || "",
        experience_summary: profile.experience || "",
        user_name: profile.name || "",
      };
      emailSubject = fillTemplate(template.subject, placeholders);
      emailBody = fillTemplate(template.body, placeholders);
    }
  }

  const resumePath = profile.resumeUrl ? path.join(process.cwd(), "public", profile.resumeUrl) : undefined;

  const result = await sendEmail({
    to: recruiterEmail,
    subject: emailSubject || "Job Application",
    body: emailBody || "Please find my application attached.",
    gmailId: profile.gmailId,
    gmailAppPassword: profile.gmailAppPassword,
    attachResume: !!profile.resumeUrl,
    resumePath,
  });

  const emailLog = await ColdEmailLog.create({
    userId, recruiterEmail, recruiterName, companyName, jobId, jobTitle, templateId,
    subject: emailSubject, body: emailBody, status: result.success ? "sent" : "failed",
    errorMessage: result.error, resumeAttached: !!profile.resumeUrl,
  });

  if (result.success) {
    profile.dailyEmailSentCount += 1;
    await profile.save();
    await ActivityLog.create({
      userId, action: `Sent email to ${recruiterName || recruiterEmail}`,
      actionType: "email_sent", details: { recruiterEmail, companyName, jobTitle },
    });
    return json({ message: "Email sent successfully", remaining: dailyLimit - profile.dailyEmailSentCount, emailLog });
  } else {
    return json({ error: result.error || "Failed to send email.", emailLog }, 500);
  }
}

async function sendBulkEmails(userId: string, body: any) {
  const { recipients, subject, body: emailBodyRaw, templateId } = body;
  if (!recipients || !Array.isArray(recipients) || recipients.length === 0) return json({ error: "Recipients array is required" }, 400);

  const profile = await UserProfile.findOne({ userId });
  if (!profile || !profile.gmailId || !profile.gmailAppPassword) return json({ error: "Gmail credentials not configured" }, 400);

  const subscription = await Subscription.findOne({ userId, status: "active", endDate: { $gte: new Date() } });
  if (!subscription) return json({ error: "Subscription required", requiresSubscription: true }, 403);

  const dailyLimit = getDailyLimitForSubscription(subscription);
  const remaining = dailyLimit - profile.dailyEmailSentCount;

  if (remaining <= 0) return json({ error: "Daily email limit reached." }, 429);

  const toSend = recipients.slice(0, remaining);
  const results = { sent: 0, failed: 0, errors: [] as string[] };

  for (const recipient of toSend) {
    let emailSubject = subject;
    let emailBody = emailBodyRaw;

    const placeholders = {
      recruiter_name: recipient.recruiterName || "Hiring Manager",
      job_role: recipient.jobTitle || "the open position",
      company_name: recipient.companyName || "your company",
      skills: profile.skills?.join(", ") || "",
      experience_summary: profile.experience || "",
      user_name: profile.name || "",
    };

    if (templateId) {
      const template = await EmailTemplate.findById(templateId);
      if (template) {
        emailSubject = fillTemplate(template.subject, placeholders);
        emailBody = fillTemplate(template.body, placeholders);
      }
    } else {
      emailSubject = fillTemplate(emailSubject || "", placeholders);
      emailBody = fillTemplate(emailBody || "", placeholders);
    }

    const resumePath = profile.resumeUrl ? path.join(process.cwd(), "public", profile.resumeUrl) : undefined;
    const result = await sendEmail({
      to: recipient.email, subject: emailSubject, body: emailBody, gmailId: profile.gmailId,
      gmailAppPassword: profile.gmailAppPassword, attachResume: !!profile.resumeUrl, resumePath,
    });

    await ColdEmailLog.create({
      userId, recruiterEmail: recipient.email, recruiterName: recipient.recruiterName,
      companyName: recipient.companyName, jobTitle: recipient.jobTitle, subject: emailSubject,
      body: emailBody, status: result.success ? "sent" : "failed", errorMessage: result.error, resumeAttached: !!profile.resumeUrl,
    });

    if (result.success) {
      results.sent++;
      profile.dailyEmailSentCount++;
    } else {
      results.failed++;
      results.errors.push(`${recipient.email}: ${result.error}`);
    }
  }

  await profile.save();
  return json({ message: `Sent ${results.sent} emails, ${results.failed} failed`, results, remaining: dailyLimit - profile.dailyEmailSentCount, skipped: recipients.length - toSend.length });
}

async function getEmailLogs(req: NextRequest, userId: string) {
  const url = new URL(req.url);
  const page = url.searchParams.get("page") || "1";
  const limit = url.searchParams.get("limit") || "50";
  const status = url.searchParams.get("status");
  const startDate = url.searchParams.get("startDate");
  const endDate = url.searchParams.get("endDate");
  const skip = (Number(page) - 1) * Number(limit);

  const query: any = { userId };
  if (status) query.status = status;
  if (startDate || endDate) {
    query.timestamp = {};
    if (startDate) query.timestamp.$gte = new Date(startDate);
    if (endDate) query.timestamp.$lte = new Date(endDate);
  }

  const logs = await ColdEmailLog.find(query).populate("jobId", "title company").sort({ timestamp: -1 }).skip(skip).limit(Number(limit));
  const total = await ColdEmailLog.countDocuments(query);

  return json({ logs, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) } });
}

async function getEmailTemplates(userId: string) {
  const templates = await EmailTemplate.find({ userId }).sort({ isDefault: -1, createdAt: -1 });
  return json({ templates });
}

async function createEmailTemplate(userId: string, body: any) {
  const { name, subject, body: emailBody, isDefault } = body;
  if (!name || !subject || !emailBody) return json({ error: "Name, subject, and body are required" }, 400);

  if (isDefault) await EmailTemplate.updateMany({ userId }, { isDefault: false });

  const template = await EmailTemplate.create({ userId, name, subject, body: emailBody, isDefault: isDefault || false });
  return json({ message: "Template created successfully", template }, 201);
}

async function updateEmailTemplate(userId: string, id: string, body: any) {
  const { name, subject, body: emailBody, isDefault } = body;
  const template = await EmailTemplate.findOne({ _id: id, userId });
  if (!template) return json({ error: "Template not found" }, 404);

  if (isDefault) await EmailTemplate.updateMany({ userId, _id: { $ne: id } }, { isDefault: false });

  if (name !== undefined) template.name = name;
  if (subject !== undefined) template.subject = subject;
  if (emailBody !== undefined) template.body = emailBody;
  if (isDefault !== undefined) template.isDefault = isDefault;
  await template.save();

  return json({ message: "Template updated successfully", template });
}

async function deleteEmailTemplate(userId: string, id: string) {
  const template = await EmailTemplate.findOneAndDelete({ _id: id, userId });
  if (!template) return json({ error: "Template not found" }, 404);
  return json({ message: "Template deleted successfully" });
}

async function getAvailableRecruiters(req: NextRequest) {
  const url = new URL(req.url);
  const search = url.searchParams.get("search");
  const company = url.searchParams.get("company");
  const industry = url.searchParams.get("industry");

  const query: any = { isInternal: true };
  if (search) {
    query.$or = [{ recruiterName: { $regex: search, $options: "i" } }, { recruiterEmail: { $regex: search, $options: "i" } }, { companyName: { $regex: search, $options: "i" } }];
  }
  if (company) query.companyName = { $regex: company, $options: "i" };
  if (industry) query.industry = { $regex: industry, $options: "i" };

  const recruiters = await Recruiter.find(query).limit(100);
  return json({ recruiters });
}
