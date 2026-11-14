import app from "./app.js";
import { connectDb } from "./config/db.js";
import { env } from "./config/env.js";
import { expireStaleHolds } from "./utils/bookingLifecycle.js";

const start = async () => {
  await connectDb();
  const server = app.listen(env.port, "0.0.0.0", () => {
    console.log(`API running on http://localhost:${env.port}`);
  });

  // Release 48h holds on unpaid bookings (also done lazily on requests for serverless).
  const sweep = () => expireStaleHolds().catch((error) => console.error("Hold sweep failed", error.message));
  setInterval(sweep, 10 * 60 * 1000).unref();
  sweep();

  server.on("error", (error) => {
    console.error("API server error", error);
  });

  server.on("close", () => {
    console.log("API server closed");
  });
};

start().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
