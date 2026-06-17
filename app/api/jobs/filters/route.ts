import { NextRequest, NextResponse } from "next/server";
import { Job } from "@/lib/models/index";
import connectDB from "@/lib/db";

const json = (data: any, status = 200) => NextResponse.json(data, { status });

export async function GET(req: NextRequest) {
  await connectDB();

  try {
    const locations = await Job.distinct("location", { isActive: true, location: { $ne: null } });
    const companies = await Job.distinct("company", { isActive: true });
    const skills = await Job.distinct("requiredSkills", { isActive: true });
    const jobTypes = ["full-time", "part-time", "contract", "internship", "remote"];
    const experienceLevels = ["entry", "mid", "senior", "lead"];

    return json({
      filters: {
        locations: locations.filter(Boolean).sort(),
        companies: companies.filter(Boolean).sort(),
        skills: skills.filter(Boolean).sort(),
        jobTypes,
        experienceLevels,
      },
    });
  } catch (error) {
    console.error("Get job filters error:", error);
    return json({ error: "Internal server error" }, 500);
  }
}
