import { v2 as cloudinary } from "cloudinary";

import * as dotenv from "dotenv";

import axios from "axios";

dotenv.config();

import { Client, Databases, ID, Query } from "appwrite";
const client = new Client()
  .setEndpoint(process.env.END_POINT) // Your Appwrite Endpoint
  .setProject(process.env.PROJECT_ID); // Your project ID

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDNIRARY_CLOOD_NAME,
  api_key: process.env.CLOUDNIRARY_API_KEY,
  api_secret: process.env.CLOUDNIRARY_API_SECRET,
});

export const generatePosts = async (req, res) => {
  const prompt = req.body?.prompt;
  if (typeof prompt !== "string" || !prompt.trim()) {
    return res.status(400).send("Enter an image prompt.");
  }

  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID?.trim();
  const apiKey = process.env.CLOUDFLARE_API_KEY?.trim();
  if (!accountId || !apiKey) {
    console.error("Cloudflare Workers AI credentials are missing.");
    return res.status(503).send("Image generation is unavailable.");
  }

  try {
    const response = await axios.post(
      `https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(accountId)}/ai/run/@cf/black-forest-labs/flux-1-schnell`,
      { prompt: prompt.trim(), steps: 4 },
      {
        headers: { Authorization: `Bearer ${apiKey}` },
        timeout: 30_000,
      },
    );

    const photo = response.data?.result?.image;
    if (response.data?.success === false || typeof photo !== "string" || !photo) {
      console.error("Cloudflare Workers AI returned no image.");
      return res.status(502).send("Image generation failed.");
    }

    return res.status(200).json({ photo });
  } catch (error) {
    const status = error?.response?.status;
    console.error("Cloudflare Workers AI request failed.", {
      status,
      providerCodes: error?.response?.data?.errors?.map?.(({ code }) => code),
      code: error?.code,
    });

    if (status === 429) {
      return res.status(429).send("Image generation limit reached. Try again later.");
    }

    return res.status(502).send("Image generation failed.");
  }
};

export const getPosts = async (req, res) => {
  const page = Number(req.query.page ?? 1);
  const perPage = 8;
  const offset = (page - 1) * perPage;
  if (!Number.isSafeInteger(offset) || !Number.isInteger(page) || page < 1) {
    return res.status(400).json({ success: false, message: "Invalid page." });
  }

  try {
    const databases = new Databases(client);
    const list = (queries) =>
      databases.listDocuments(process.env.DATABASE_ID, process.env.COLLECTION_ID, queries);
    const search = typeof req.query.search === "string" ? req.query.search.trim() : "";

    if (search) {
      const data = await list([
        Query.limit(perPage),
        Query.offset(offset),
        Query.search("prompt", search),
        Query.orderDesc("prompt"),
      ]);
      return res.status(200).json({ success: true, data, type: "appWrite search" });
    }

    const pinned = await list([
      Query.equal("pinned", true),
      Query.orderAsc("$createdAt"),
      Query.limit(perPage),
      Query.offset(offset),
    ]);
    const remaining = perPage - pinned.documents.length;
    const regular = await list([
      Query.equal("pinned", false),
      Query.orderDesc("$createdAt"),
      Query.limit(Math.max(1, remaining)),
      Query.offset(remaining ? Math.max(0, offset - pinned.total) : 0),
    ]);
    const data = {
      documents: [...pinned.documents, ...regular.documents.slice(0, remaining)],
      total: pinned.total + regular.total,
    };
    return res.status(200).json({ success: true, data, type: "appWrite" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error });
  }
};

export const getRecentPosts = async (req, res) => {
  try {
    // Define the number of documents per page
    const perPage = 8;

    // Retrieve the page number from the query parameter
    const page = req.query.page || 1;

    // Calculate the offset to skip documents based on the page number
    const offset = (page - 1) * perPage;

    // Create the query to limit the number of documents and skip the offset
    const query = [
      Query.limit(perPage),
      Query.offset(offset),
      Query.equal("pinned", false),
      Query.orderDesc("$createdAt"),
    ];
    const databases = new Databases(client);

    // Retrieve a limited number of documents with pagination
    const documents = await databases.listDocuments(
      process.env.DATABASE_ID,
      process.env.COLLECTION_ID,
      query,
    );

    res.status(200).json({
      success: true,
      data: documents,
      type: "appWrite",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error });
  }
};

export const createPost = async (req, res) => {
  try {
    const { name, prompt, photo, pinned } = req.body;

    // uploading photos to cloudinary for better performance
    const photoUrl = await cloudinary.uploader.upload(photo, {
      timeout: 12000000,
      format: "webp",
      // Adjust the WEBP quality to reduce the file size
      quality: 80,
      secure: true,
    });

    // Create a new document payload
    const payload = {
      name,
      prompt,
      photo: photoUrl.url,
      pinned,
    };

    const databases = new Databases(client);

    const document = await databases.createDocument(
      process.env.DATABASE_ID,
      process.env.COLLECTION_ID,
      ID.unique(),
      payload,
    );

    res.status(201).json({ success: true, data: document, type: "appWrite" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error });
  }
};
