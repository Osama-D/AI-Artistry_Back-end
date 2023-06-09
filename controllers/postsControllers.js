import { v2 as cloudinary } from "cloudinary";

import { Configuration, OpenAIApi } from "openai";

import * as dotenv from "dotenv";

import sharp from "sharp";

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

// Openai Configuration
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export const generatePosts = async (req, res) => {
  try {
    const { prompt } = req.body;
    const aiResponse = await openai.createImage({
      prompt,
      n: 1,
      size: "1024x1024",
      response_format: "b64_json",
    });
    const imageBuffer = Buffer.from(aiResponse.data.data[0].b64_json, "base64");

    // Adjust the quality
    const compressedImageBuffer = await sharp(imageBuffer)
      .jpeg({ quality: 90 }) // Adjust the JPEG quality to reduce the file size
      .toBuffer();

    const compressedImageData = compressedImageBuffer.toString("base64");

    res.status(200).json({ photo: compressedImageData });
  } catch (error) {
    console.log(error);
    res.status(500).send(error?.response.data.error.message);
  }
};

export const getPosts = async (req, res) => {
  try {
    const databases = new Databases(client);

    const page = req.query.page || 1;
    const perPage = 8; // Define the number of documents per page

    const search = req.query.search || "";
    if (search) {
      // If there is a search term provided

      const searchQuery = [
        Query.limit(perPage),
        Query.offset((page - 1) * perPage),
        Query.search("prompt", search),
        Query.orderDesc("prompt"), // Sort the search results by prompt in descending order
      ];

      // Retrieve searched documents
      const searchedDocuments = await databases.listDocuments(
        process.env.DATABASE_ID,
        process.env.COLLECTION_ID,
        searchQuery
      );
      const searchDocuments = [[...searchedDocuments.documents]];
      const searchTotal = searchedDocuments.total;

      const searchResponseData = {
        documents: searchDocuments[0],
        total: searchTotal,
      };
      res.status(200).json({
        success: true,
        data: searchResponseData,
        type: "appWrite search",
      });
    } else {
      // If no search term is provided

      const pinnedQuery = [
        Query.limit(3), // Limit the number of pinned documents to 3
        Query.offset((page - 1) * perPage),
        Query.equal("pinned", true), // Filter for documents where "pinned" is true
        Query.orderAsc("$createdAt"), // Sort the pinned documents based on createdAt in ascending order
      ];

      const unpinnedQuery = [
        Query.limit(page === 1 ? perPage - 3 : perPage), // Subtracting the limit for the 3 pinned documents if page === 1 (which means it will only bring 5 unpinned data)
        Query.offset(
          page === 1 ? (page - 1) * perPage : (page - 1) * perPage - 3
        ), // if page === 1 you will start cutting data from 0 IF NOT you will start cutting data from 5 instead of 8 since we have brought only 5 unpinned data in page 1
        Query.equal("pinned", false), // Filter for documents where "pinned" is false
        Query.orderDesc("$createdAt"), // Sort the unpinned documents based on createdAt in descending order
      ];

      // Retrieve pinned documents
      const pinnedDocuments = await databases.listDocuments(
        process.env.DATABASE_ID,
        process.env.COLLECTION_ID,
        pinnedQuery
      );

      // Retrieve unpinned documents
      const unpinnedDocuments = await databases.listDocuments(
        process.env.DATABASE_ID,
        process.env.COLLECTION_ID,
        unpinnedQuery
      );

      // Combine the pinned and unpinned documents for page 1 and bring the rest if page > 1 without pinned documents
      const documents = [
        page === 1
          ? [...pinnedDocuments.documents, ...unpinnedDocuments.documents]
          : [...unpinnedDocuments.documents],
      ];

      const total = pinnedDocuments.total + unpinnedDocuments.total;

      const responseData = {
        documents: documents[0],
        total: total,
      };

      res.status(200).json({
        success: true,
        data: responseData,
        type: "appWrite",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error });
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
      query
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

    // uploading photos to cloudinary for performance improvement
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

    databases.createDocument(
      process.env.DATABASE_ID,
      process.env.COLLECTION_ID,
      ID.unique(),
      payload
    );

    res.status(201).json({ success: true, data: payload, type: "appWrite" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error });
  }
};
