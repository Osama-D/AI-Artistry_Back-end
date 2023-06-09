import express from "express";
import * as dotenv from "dotenv";
import cors from "cors";
import compression from "compression";
import postRoutes from "./routes/postRoutes.js";
import dalleRoutes from "./routes/dalleRoutes.js";

dotenv.config();
const app = express();
app.use(compression());

app.use(cors());
app.use(express.json({ limit: "50mb" }));

app.use("/api/v1/posts", postRoutes);
app.use("/api/v1/dalle", dalleRoutes);

const PORT = 5000;

app.listen(PORT, () => console.log(`Server running on port: ${PORT}`));
