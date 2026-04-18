import app from "../src/app.js";
import { connectDb } from "../src/config/db.js";

export default async function handler(req, res) {
  try {
    await connectDb();
    return app(req, res);
  } catch (error) {
    console.error("Database connection failed", error);
    return res.status(500).json({
      message: "Database connection failed",
      error: error?.message || "Unknown database error",
    });
  }
}
