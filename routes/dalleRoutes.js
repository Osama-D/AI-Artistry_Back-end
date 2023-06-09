import express from "express";
import { generatePosts } from "../controllers/postsControllers.js";

const router = express.Router();

router.post("/", generatePosts);

export default router;
