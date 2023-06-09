import express from "express";
import {
  getPosts,
  getRecentPosts,
  createPost,
} from "../controllers/postsControllers.js";

const router = express.Router();

router.get("/", getPosts);
router.get("/recent", getRecentPosts);
router.post("/", createPost);

export default router;
