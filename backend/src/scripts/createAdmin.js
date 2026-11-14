import { connectDb } from "../config/db.js";
import { assertSafeSeedTarget, requireAdminSeedCredentials } from "../config/validateEnv.js";
import { User } from "../models/User.js";

const createAdmin = async () => {
  assertSafeSeedTarget("create-admin");
  const adminCredentials = requireAdminSeedCredentials();
  await connectDb();

  const { email, password } = adminCredentials;

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
