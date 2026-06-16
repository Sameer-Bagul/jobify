import { NextRequest, NextResponse } from "next/server";
import { Job, UserProfile, ActivityLog } from "@/lib/models/index";
import { requireAuth, handleAuthError } from "@/lib/utils/auth-server";
import { calculateMatchScore, getMatchCategory } from "@/lib/utils/matchingScore";
import connectDB from "@/lib/db";

const json = (data: any, status = 200) => NextResponse.json(data, { status });

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await params;
  
  try {
    const user = requireAuth(req);
    const profile = await UserProfile.findOne({ userId: user.userId });
    if (!profile) return json({ error: "Profile not found" }, 404);

    const job = await Job.findById(id);
    if (!job) return json({ error: "Job not found" }, 404);

    const matchScore = calculateMatchScore(
      { skills: profile.skills || [], experience: profile.experience },
      { requiredSkills: job.requiredSkills || [], experienceLevel: job.experienceLevel }
    );

    const matchingSkills = (profile.skills || []).filter((skill: string) =>
      (job.requiredSkills || []).some(
        (reqSkill: string) => reqSkill.toLowerCase().includes(skill.toLowerCase()) ||
                      skill.toLowerCase().includes(reqSkill.toLowerCase())
      )
    );

    const missingSkills = (job.requiredSkills || []).filter((reqSkill: string) =>
      !(profile.skills || []).some(
        (skill: string) => skill.toLowerCase().includes(reqSkill.toLowerCase()) ||
                   reqSkill.toLowerCase().includes(skill.toLowerCase())
      )
    );

    await ActivityLog.create({
      userId: user.userId,
      action: `Viewed job: ${job.title}`,
      actionType: "job_viewed",
      details: { jobId: job._id, matchScore },
    });

    return json({
      matchScore,
      matchCategory: getMatchCategory(matchScore),
      matchingSkills,
      missingSkills,
      totalRequired: job.requiredSkills?.length || 0,
      totalMatched: matchingSkills.length,
    });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") return handleAuthError(error);
    console.error("Get job match score error:", error);
    return json({ error: "Internal server error" }, 500);
  }
}
