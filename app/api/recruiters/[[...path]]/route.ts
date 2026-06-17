import { NextRequest, NextResponse } from "next/server";
import { Recruiter, Job, UserProfile } from "@/lib/models/index";
import { requireAuth, requireRole, handleAuthError } from "@/lib/utils/auth-server";
import { calculateMatchScore, getMatchCategory } from "@/lib/utils/matchingScore";
import connectDB from "@/lib/db";

const json = (data: any, status = 200) => NextResponse.json(data, { status });

export async function GET(req: NextRequest, { params }: { params: Promise<{ path?: string[] }> }) {
  await connectDB();
  try {
    const user = requireAuth(req);
    requireRole(req, "recruiter");
    const { path: routePath } = await params;
    const action = routePath ? routePath[0] : "";

    if (action === "profile") return await getRecruiterProfile(user.userId);
    if (action === "dashboard") return await getRecruiterDashboardStats(user.userId);
    if (action === "jobs" && !routePath![1]) return await getRecruiterJobs(user.userId);
    if (action === "jobs" && routePath![1] && !routePath![2]) return await getRecruiterJobById(user.userId, routePath![1]);
    if (action === "jobs" && routePath![1] && routePath![2] === "candidates") return await getJobCandidates(user.userId, routePath![1]);

    return json({ error: "Not found" }, 404);
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN") return handleAuthError(error);
    console.error("Recruiter GET error:", error);
    return json({ error: "Internal server error" }, 500);
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ path?: string[] }> }) {
  await connectDB();
  try {
    const user = requireAuth(req);
    requireRole(req, "recruiter");
    const { path: routePath } = await params;
    const action = routePath ? routePath[0] : "";
    const body = await req.json().catch(() => ({}));

    if (action === "onboarding") return await completeRecruiterOnboarding(user.userId, body);
    if (action === "jobs") return await createJob(user.userId, body);

    return json({ error: "Not found" }, 404);
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN") return handleAuthError(error);
    console.error("Recruiter POST error:", error);
    return json({ error: "Internal server error" }, 500);
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ path?: string[] }> }) {
  await connectDB();
  try {
    const user = requireAuth(req);
    requireRole(req, "recruiter");
    const { path: routePath } = await params;
    const action = routePath ? routePath[0] : "";
    const body = await req.json().catch(() => ({}));

    if (action === "profile") return await updateRecruiterProfile(user.userId, body);
    if (action === "jobs" && routePath![1]) return await updateJob(user.userId, routePath![1], body);

    return json({ error: "Not found" }, 404);
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN") return handleAuthError(error);
    console.error("Recruiter PUT error:", error);
    return json({ error: "Internal server error" }, 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ path?: string[] }> }) {
  await connectDB();
  try {
    const user = requireAuth(req);
    requireRole(req, "recruiter");
    const { path: routePath } = await params;

    if (routePath && routePath[0] === "jobs" && routePath[1]) {
      return await deleteJob(user.userId, routePath[1]);
    }

    return json({ error: "Not found" }, 404);
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN") return handleAuthError(error);
    console.error("Recruiter DELETE error:", error);
    return json({ error: "Internal server error" }, 500);
  }
}

async function getRecruiterProfile(userId: string) {
  const recruiter = await Recruiter.findOne({ userId });
  if (!recruiter) return json({ error: "Recruiter profile not found" }, 404);
  return json({ recruiter });
}

async function updateRecruiterProfile(userId: string, body: any) {
  const { companyName, recruiterName, recruiterEmail, phone, linkedinUrl, industry, location } = body;
  const recruiter = await Recruiter.findOne({ userId });
  if (!recruiter) return json({ error: "Recruiter profile not found" }, 404);

  if (companyName !== undefined) recruiter.companyName = companyName;
  if (recruiterName !== undefined) recruiter.recruiterName = recruiterName;
  if (recruiterEmail !== undefined) recruiter.recruiterEmail = recruiterEmail;
  if (phone !== undefined) recruiter.phone = phone;
  if (linkedinUrl !== undefined) recruiter.linkedinUrl = linkedinUrl;
  if (industry !== undefined) recruiter.industry = industry;
  if (location !== undefined) recruiter.location = location;

  await recruiter.save();
  return json({ message: "Profile updated successfully", recruiter });
}

async function completeRecruiterOnboarding(userId: string, body: any) {
  const { companyName, recruiterName, phone, linkedinUrl, industry, location } = body;
  if (!companyName || !recruiterName) return json({ error: "Company name and recruiter name are required" }, 400);

  const recruiter = await Recruiter.findOne({ userId });
  if (!recruiter) return json({ error: "Recruiter profile not found" }, 404);

  recruiter.companyName = companyName;
  recruiter.recruiterName = recruiterName;
  if (phone !== undefined) recruiter.phone = phone;
  if (linkedinUrl !== undefined) recruiter.linkedinUrl = linkedinUrl;
  if (industry !== undefined) recruiter.industry = industry;
  if (location !== undefined) recruiter.location = location;
  recruiter.onboardingCompleted = true;

  await recruiter.save();
  return json({ message: "Onboarding completed successfully", recruiter });
}

async function createJob(userId: string, body: any) {
  const { title, company, description, requiredSkills, location, jobType, experienceLevel, salaryMin, salaryMax, salaryCurrency, applicationDeadline } = body;
  if (!title || !company) return json({ error: "Job title and company are required" }, 400);

  const recruiter = await Recruiter.findOne({ userId });
  if (!recruiter) return json({ error: "Recruiter profile not found" }, 404);

  const job = await Job.create({
    recruiterId: recruiter._id, recruiterUserId: userId, title, company, description, requiredSkills: requiredSkills || [], location,
    jobType: jobType || "full-time", experienceLevel: experienceLevel || "mid", salaryMin: salaryMin || 0, salaryMax: salaryMax || 0,
    salaryCurrency: salaryCurrency || "INR", applicationDeadline: applicationDeadline ? new Date(applicationDeadline) : undefined,
  });

  return json({ message: "Job created successfully", job }, 201);
}

async function getRecruiterJobs(userId: string) {
  const recruiter = await Recruiter.findOne({ userId });
  if (!recruiter) return json({ error: "Recruiter profile not found" }, 404);

  const jobs = await Job.find({ recruiterId: recruiter._id }).sort({ createdAt: -1 });
  const jobsWithStats = jobs.map((job) => ({ ...job.toObject(), stats: { views: job.viewCount || 0, applications: job.applicationCount || 0 } }));

  return json({ jobs: jobsWithStats });
}

async function getRecruiterJobById(userId: string, id: string) {
  const recruiter = await Recruiter.findOne({ userId });
  if (!recruiter) return json({ error: "Recruiter profile not found" }, 404);

  const job = await Job.findOne({ _id: id, recruiterId: recruiter._id });
  if (!job) return json({ error: "Job not found" }, 404);

  return json({ job });
}

async function updateJob(userId: string, id: string, body: any) {
  const { title, company, description, requiredSkills, location, jobType, experienceLevel, salaryMin, salaryMax, salaryCurrency, applicationDeadline, isActive } = body;
  const recruiter = await Recruiter.findOne({ userId });
  if (!recruiter) return json({ error: "Recruiter profile not found" }, 404);

  const job = await Job.findOne({ _id: id, recruiterId: recruiter._id });
  if (!job) return json({ error: "Job not found" }, 404);

  if (title !== undefined) job.title = title;
  if (company !== undefined) job.company = company;
  if (description !== undefined) job.description = description;
  if (requiredSkills !== undefined) job.requiredSkills = requiredSkills;
  if (location !== undefined) job.location = location;
  if (jobType !== undefined) job.jobType = jobType;
  if (experienceLevel !== undefined) job.experienceLevel = experienceLevel;
  if (salaryMin !== undefined) job.salaryMin = salaryMin;
  if (salaryMax !== undefined) job.salaryMax = salaryMax;
  if (salaryCurrency !== undefined) job.salaryCurrency = salaryCurrency;
  if (applicationDeadline !== undefined) job.applicationDeadline = new Date(applicationDeadline);
  if (isActive !== undefined) job.isActive = isActive;

  await job.save();
  return json({ message: "Job updated successfully", job });
}

async function deleteJob(userId: string, id: string) {
  const recruiter = await Recruiter.findOne({ userId });
  if (!recruiter) return json({ error: "Recruiter profile not found" }, 404);

  const job = await Job.findOne({ _id: id, recruiterId: recruiter._id });
  if (!job) return json({ error: "Job not found" }, 404);

  job.isActive = false;
  await job.save();

  return json({ message: "Job deleted successfully" });
}

async function getJobCandidates(userId: string, jobId: string) {
  const recruiter = await Recruiter.findOne({ userId });
  if (!recruiter) return json({ error: "Recruiter profile not found" }, 404);

  const job = await Job.findOne({ _id: jobId, recruiterId: recruiter._id });
  if (!job) return json({ error: "Job not found" }, 404);

  const profiles = await UserProfile.find({ skills: { $exists: true, $ne: [] }, onboardingCompleted: true }).populate({ path: "userId", select: "email" });

  const candidates = profiles
    .map((profile) => {
      const matchScore = calculateMatchScore({ skills: profile.skills || [], experience: profile.experience }, { requiredSkills: job.requiredSkills || [], experienceLevel: job.experienceLevel });
      const matchingSkills = (profile.skills || []).filter((skill: string) => (job.requiredSkills || []).some((jobSkill: string) => jobSkill.toLowerCase().includes(skill.toLowerCase()) || skill.toLowerCase().includes(jobSkill.toLowerCase())));

      return { id: profile._id, name: profile.name, email: (profile.userId as any)?.email, skills: profile.skills, experience: profile.experience, resumeUrl: profile.resumeUrl, matchScore, matchCategory: getMatchCategory(matchScore), matchingSkills };
    })
    .filter((c) => c.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore);

  return json({ candidates, totalMatched: candidates.length });
}

async function getRecruiterDashboardStats(userId: string) {
  const recruiter = await Recruiter.findOne({ userId });
  if (!recruiter) return json({ error: "Recruiter profile not found" }, 404);

  const totalJobs = await Job.countDocuments({ recruiterId: recruiter._id });
  const activeJobs = await Job.countDocuments({ recruiterId: recruiter._id, isActive: true });
  
  const jobs = await Job.find({ recruiterId: recruiter._id });
  const totalViews = jobs.reduce((sum, job) => sum + (job.viewCount || 0), 0);
  const totalApplications = jobs.reduce((sum, job) => sum + (job.applicationCount || 0), 0);

  return json({ stats: { totalJobs, activeJobs, totalViews, totalApplications } });
}
