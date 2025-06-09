import express from "express";
import cors from "cors";
import MainRoutes from "./routes/MainRoutes.js";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ CORS Configuration (Allow any origin)
const corsOptions = {
  origin: "*", // This allows all domains to access the server
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions)); // Apply the CORS configuration globally
app.options("*", cors(corsOptions)); // Pre-flight requests for all routes

// ✅ Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ✅ API routes
app.use("/api/BeyondBox", MainRoutes);

// ✅ Serve React frontend
const buildPath = path.join(__dirname, "build"); // Make sure build folder is in the same directory
app.use(express.static(buildPath));

// ✅ Catch-all: serve index.html for unknown routes
app.get("*", (req, res) => {
  res.sendFile(path.join(buildPath, "index.html"));
});

// ✅ Error handler
app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

export default app;
