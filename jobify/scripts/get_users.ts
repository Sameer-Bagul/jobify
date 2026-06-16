import mongoose from "mongoose";
import { loadEnvConfig } from "@next/env";

// Load environment variables from .env.local
const projectDir = process.cwd();
loadEnvConfig(projectDir);

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("Error: MONGODB_URI is not defined in .env.local");
  process.exit(1);
}

// Minimal user schema to fetch data without loading the full app models
const userSchema = new mongoose.Schema({
  email: String,
  role: String,
  isActive: Boolean,
  lastLogin: Date,
  createdAt: Date
}, { collection: 'users' });

const User = mongoose.model("User", userSchema);

async function getUsers() {
  try {
    await mongoose.connect(MONGODB_URI as string);
    console.log("Connected to MongoDB");

    // Fetch users but strictly exclude the passwordHash field
    const users = await User.find({}, { passwordHash: 0 }).sort({ createdAt: -1 });

    console.log(`Found ${users.length} users:`);
    console.table(users.map(u => ({
      ID: u._id.toString(),
      Email: u.email,
      Role: u.role,
      Active: u.isActive,
      Joined: u.createdAt?.toISOString().split('T')[0]
    })));

  } catch (err) {
    console.error("Failed to fetch users:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

getUsers();
