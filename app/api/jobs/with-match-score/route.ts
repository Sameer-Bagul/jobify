import { NextRequest, NextResponse } from "next/server";
import { Job, UserProfile, SavedItem } from "@/lib/models/index";
import { requireAuth, handleAuthError } from "@/lib/utils/auth-server";
import { calculateMatchScore, getMatchCategory } from "@/lib/utils/matchingScore";
import connectDB from "@/lib/db";

const json = (data: any, status = 200) => NextResponse.json(data, { status });

export async function GET(req: NextRequest) {
  await connectDB();
  
  try {
    const user = requireAuth(req);
    const url = new URL(req.url);
    const page = url.searchParams.get("page") || "1";
    const limit = url.searchParams.get("limit") || "20";
    const skill = url.searchParams.get("skill");
    const location = url.searchParams.get("location");
    const company = url.searchParams.get("company");
    const minScore = url.searchParams.get("minScore") || "0";

    const skip = (Number(page) - 1) * Number(limit);

    const profile = await UserProfile.findOne({ userId: user.userId });
    if (!profile) return json({ error: "Profile not found" }, 404);

    const query: any = { isActive: true };
    if (skill) query.requiredSkills = { $regex: skill, $options: "i" };
    if (location) query.location = { $regex: location, $options: "i" };
    if (company) query.company = { $regex: company, $options: "i" };

    const jobs = await Job.find(query)
      .populate({ path: "recruiterId", select: "companyName recruiterName recruiterEmail" })
      .sort({ createdAt: -1 });

    const savedJobIds = await SavedItem.find({ userId: user.userId, itemType: "job" }).distinct("itemId");

    const jobsWithScore = jobs.map((job) => {
      const matchScore = calculateMatchScore(
        { skills: profile.skills || [], experience: profile.experience },
        { requiredSkills: job.requiredSkills || [], experienceLevel: job.experienceLevel }
      );
      return {
        ...job.toObject(),
        matchScore,
        matchCategory: getMatchCategory(matchScore),
        isSaved: savedJobIds.some((id) => id.toString() === job._id.toString()),
      };
    });

    const filteredJobs = jobsWithScore
      .filter((job) => job.matchScore >= Number(minScore))
      .sort((a, b) => b.matchScore - a.matchScore);

    const paginatedJobs = filteredJobs.slice(skip, skip + Number(limit));

    return json({
      jobs: paginatedJobs,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: filteredJobs.length,
        pages: Math.ceil(filteredJobs.length / Number(limit)),
      },
    });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") return handleAuthError(error);
    console.error("Get jobs with match score error:", error);
    return json({ error: "Internal server error" }, 500);
  }
}
