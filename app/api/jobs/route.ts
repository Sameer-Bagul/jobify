import { NextRequest, NextResponse } from "next/server";
import { Job } from "@/lib/models/index";
import connectDB from "@/lib/db";

const json = (data: any, status = 200) => NextResponse.json(data, { status });

export async function GET(req: NextRequest) {
  await connectDB();

  try {
    const url = new URL(req.url);
    const page = url.searchParams.get("page") || "1";
    const limit = url.searchParams.get("limit") || "20";
    const skill = url.searchParams.get("skill");
    const location = url.searchParams.get("location");
    const company = url.searchParams.get("company");
    const jobType = url.searchParams.get("jobType");
    const experienceLevel = url.searchParams.get("experienceLevel");
    const search = url.searchParams.get("search");

    const skip = (Number(page) - 1) * Number(limit);
    const query: any = { isActive: true };

    if (skill) query.requiredSkills = { $regex: skill, $options: "i" };
    if (location) query.location = { $regex: location, $options: "i" };
    if (company) query.company = { $regex: company, $options: "i" };
    if (jobType) query.jobType = jobType;
    if (experienceLevel) query.experienceLevel = experienceLevel;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const jobs = await Job.find(query)
      .populate({ path: "recruiterId", select: "companyName recruiterName recruiterEmail" })
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Job.countDocuments(query);

    return json({
      jobs,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error("Get jobs error:", error);
    return json({ error: "Internal server error" }, 500);
  }
}
