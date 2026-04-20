export default async function handler(req, res) {
  const requestPath = String(req.url || "").split("?")[0];

  if (requestPath === "/api/version" || requestPath === "/version") {
    return res.status(200).json({
      status: "ok",
      version: "backend-health-decoupled-2026-04-19",
      timestamp: new Date().toISOString(),
    });
  }

  if (requestPath === "/api" || requestPath === "/api/health" || requestPath === "/health" || requestPath === "/") {
    return res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
  }

  if (requestPath === "/api/health/db" || requestPath === "/health/db") {
    try {
      const { connectDb, getDbStatus } = await import("../src/config/db.js");
      await connectDb();
      return res.status(200).json({
        status: "ok",
        timestamp: new Date().toISOString(),
        database: getDbStatus(),
      });
    } catch (error) {
      console.error("Database health check failed", error);
      return res.status(500).json({
        message: "Database health check failed",
        error: error?.message || "Unknown database error",
      });
    }
  }

  try {
    const [{ default: app }, { connectDb }] = await Promise.all([
      import("../src/app.js"),
      import("../src/config/db.js"),
    ]);

    await connectDb();

    return app(req, res);
  } catch (error) {
    console.error("Backend function failed", error);
    return res.status(500).json({
      message: "Backend function failed",
      error: error?.message || "Unknown server error",
    });
  }
}
