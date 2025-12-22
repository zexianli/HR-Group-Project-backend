import express from "express";
import morgan from "morgan";
import tokenRoutes from "./routes/tokenRoutes.js";
import s3TestRoutes from "./routes/s3Routes.js";
import healthRoutes from "./routes/healthRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import registrationRoutes from "./routes/registrationRoutes.js";

const app = express();

app.use(express.json());
app.use(morgan("dev"));

app.use("/api/tokens", tokenRoutes);
app.use("/api/s3", s3TestRoutes);
app.use(healthRoutes);
app.use(authRoutes);
app.use(registrationRoutes);

app.use("/api", (req, res) => {
  res.status(200).json({ message: "Hello world" });
});

export default app;
