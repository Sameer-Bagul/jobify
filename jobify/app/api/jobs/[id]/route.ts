import { NextRequest, NextResponse } from "next/server";
import { Job } from "@/lib/models/index";
import connectDB from "@/lib/db";

const json = (data: any, status = 200) => NextResponse.json(data, { status });

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await params;

  try {
    const job = await Job.findById(id).populate({
      path: "recruiterId",
      select: "companyName recruiterName recruiterEmail",
    });

    if (!job) {
      return json({ error: "Job not found" }, 404);
    }

    job.viewCount = (job.viewCount || 0) + 1;
    await job.save();

    return json({ job });
  } catch (error) {
    console.error("Get job error:", error);
    return json({ error: "Internal server error" }, 500);
  }
}
