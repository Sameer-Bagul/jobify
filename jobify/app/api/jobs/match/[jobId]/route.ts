import { NextRequest, NextResponse } from "next/server";
import { Job, UserProfile } from "@/lib/models/index";
import { requireAuth, handleAuthError } from "@/lib/utils/auth-server";
import { calculateMatchScore, getMatchCategory } from "@/lib/utils/matchingScore";
import connectDB from "@/lib/db";

const json = (data: any, status = 200) => NextResponse.json(data, { status });

export async function GET(req: NextRequest, { params }: { params: Promise<{ jobId: string }> }) {
  await connectDB();
  const { jobId } = await params;
  
  try {
    const user = requireAuth(req); // To ensure caller is authenticated

    const job = await Job.findById(jobId);
    if (!job) return json({ error: "Job not found" }, 404);

    const profiles = await UserProfile.find({
      skills: { $exists: true, $ne: [] },
    }).populate({ path: "userId", select: "email" });

    const candidates = profiles
      .map((profile) => {
        const matchScore = calculateMatchScore(
          { skills: profile.skills || [], experience: profile.experience },
          { requiredSkills: job.requiredSkills || [], experienceLevel: job.experienceLevel }
        );

        const matchingSkills = (profile.skills || []).filter((skill: string) =>
          (job.requiredSkills || []).some(
            (jobSkill: string) => jobSkill.toLowerCase().includes(skill.toLowerCase())
          )
        );

        return {
          profile: {
            id: profile._id,
            name: profile.name,
            email: (profile.userId as any)?.email,
            skills: profile.skills,
            experience: profile.experience,
            resumeUrl: profile.resumeUrl,
          },
          matchScore,
          matchCategory: getMatchCategory(matchScore),
          matchingSkills,
        };
      })
      .filter((candidate) => candidate.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore);

    return json({ candidates });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") return handleAuthError(error);
    console.error("Get matching candidates error:", error);
    return json({ error: "Internal server error" }, 500);
  }
}
