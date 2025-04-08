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

app.patch("/notion/:id/like", async (req, res) => {
  const pageId = req.params.id;

  try {
    const page = await notion.pages.retrieve({ page_id: pageId });
    const currentLikes = page.properties["likes"].number ?? 0;

    await notion.pages.update({
      page_id: pageId,
      properties: {
        likes: {
          number: currentLikes + 1,
        },
      },
    });

    res.json({ newLikes: currentLikes + 1 });
  } catch (error) {
    console.error("Error updating like:", error);
    res.status(500).send("Failed to update like");
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
