import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import morgan from "morgan";
import { env } from "./config/env.js";
import authRoutes from "./routes/auth.routes.js";
import blogsRoutes from "./routes/blogs.routes.js";
import bookingsRoutes from "./routes/bookings.routes.js";
import contactsRoutes from "./routes/contacts.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import galleryRoutes from "./routes/gallery.routes.js";
import notificationsRoutes from "./routes/notifications.routes.js";
import paymentsRoutes from "./routes/payments.routes.js";
import settingsRoutes from "./routes/settings.routes.js";
import testimonialsRoutes from "./routes/testimonials.routes.js";
import toursRoutes from "./routes/tours.routes.js";
import usersRoutes from "./routes/users.routes.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";

const app = express();

app.use(
  cors({
    origin: env.clientOrigin,
    credentials: true,
  }),
);
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use(morgan("dev"));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/tours", toursRoutes);
app.use("/api/blogs", blogsRoutes);
app.use("/api/bookings", bookingsRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/contacts", contactsRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/payments", paymentsRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/testimonials", testimonialsRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
