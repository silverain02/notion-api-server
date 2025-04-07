// server.ts
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { Client } from "@notionhq/client";

dotenv.config();

const app = express();
app.use(cors()); // CORS 허용

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const databaseId = process.env.NOTION_DATABASE_ID as string;

app.get("/notion", async (req, res) => {
  try {
    const db = await notion.databases.retrieve({ database_id: databaseId });
    const query = await notion.databases.query({ database_id: databaseId });

    res.json({ db, query });
  } catch (error) {
    console.error("Notion API error:", error);
    res.status(500).send("Error fetching Notion data");
  }
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
