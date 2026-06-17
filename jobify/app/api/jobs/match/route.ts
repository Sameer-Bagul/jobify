import { NextRequest, NextResponse } from "next/server";
import { UserProfile, Job } from "@/lib/models/index";
import { requireAuth, requireRole, handleAuthError } from "@/lib/utils/auth-server";
import connectDB from "@/lib/db";

const json = (data: any, status = 200) => NextResponse.json(data, { status });

export async function GET(req: NextRequest) {
  await connectDB();

  try {
    const user = requireAuth(req);
    requireRole(req, "seeker");

    const profile = await UserProfile.findOne({ userId: user.userId });
    if (!profile) return json({ error: "Profile not found" }, 404);

    const userSkills = profile.skills || [];

    if (userSkills.length === 0) {
      return json({ jobs: [] });
    }

    // Match jobs that have at least one intersecting skill, sorted by match percentage
    const pipeline: any[] = [
      { $match: { isActive: true } },
      {
        $addFields: {
          matchedSkills: { $setIntersection: ["$requiredSkills", userSkills] }
        }
      },
      {
        $addFields: {
          matchCount: { $size: "$matchedSkills" },
          totalRequired: { $size: { $ifNull: ["$requiredSkills", []] } }
        }
      },
      {
        $match: {
          matchCount: { $gt: 0 }
        }
      },
      {
        $addFields: {
          matchPercentage: {
            $cond: [
              { $eq: ["$totalRequired", 0] },
              0,
              { $round: [{ $multiply: [{ $divide: ["$matchCount", "$totalRequired"] }, 100] }, 0] }
            ]
          }
        }
      },
      {
        $sort: { matchPercentage: -1, createdAt: -1 }
      },
      {
        $limit: 10
      },
      {
        $lookup: {
          from: "recruiters",
          localField: "recruiterId",
          foreignField: "_id",
          as: "recruiter"
        }
      },
      {
        $unwind: { path: "$recruiter", preserveNullAndEmptyArrays: true }
      },
      {
        $project: {
          title: 1,
          company: 1,
          location: 1,
          jobType: 1,
          salaryMin: 1,
          salaryMax: 1,
          requiredSkills: 1,
          matchedSkills: 1,
          matchPercentage: 1,
          createdAt: 1,
          "recruiter.companyName": 1
        }
      }
    ];

    const matchedJobs = await Job.aggregate(pipeline as any[]);

    return json({ jobs: matchedJobs });

  } catch (error: any) {
    if (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN") return handleAuthError(error);
    console.error(`Jobs Match error:`, error);
    return json({ error: "Internal server error" }, 500);
  }
}
