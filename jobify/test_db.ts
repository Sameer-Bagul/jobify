import mongoose from "mongoose";
import { loadEnvConfig } from "@next/env";

const projectDir = process.cwd();
loadEnvConfig(projectDir);

const userProfileSchema = new mongoose.Schema({}, { strict: false });
const UserProfile = mongoose.model("UserProfile", userProfileSchema);

async function check() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  const profiles = await UserProfile.find({});
  console.log(JSON.stringify(profiles, null, 2));
  process.exit(0);
}
check();
