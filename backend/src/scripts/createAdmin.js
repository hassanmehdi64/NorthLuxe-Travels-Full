import { connectDb } from "../config/db.js";
import { env } from "../config/env.js";
import { User } from "../models/User.js";

const createAdmin = async () => {
  await connectDb();

  const email = String(env.adminEmail || "").toLowerCase().trim();
  const password = String(env.adminPassword || "").trim();

  if (!email) {
    throw new Error("ADMIN_EMAIL is required");
  }

  if (!password || password.length < 8) {
    throw new Error("ADMIN_PASSWORD must be at least 8 characters");
  }

  const existing = await User.findOne({ email });
  if (existing) {
    existing.name = existing.name || "Admin User";
    existing.role = "Admin";
    existing.status = "Active";
    if (!existing.passwordHash) {
      existing.passwordHash = await User.hashPassword(password);
    }
    await existing.save();
    console.log(`Admin already exists: ${email}`);
    process.exit(0);
  }

  const user = await User.create({
    name: "Admin User",
    email,
    passwordHash: await User.hashPassword(password),
    role: "Admin",
    status: "Active",
  });

  console.log(`Admin created: ${user.email}`);
  process.exit(0);
};

createAdmin().catch((error) => {
  console.error(error);
  process.exit(1);
});
