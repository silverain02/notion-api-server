import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import { Client } from "@notionhq/client";

dotenv.config();

const app = express();
// 1. CORS middleware
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

// OPTIONS 프리플라이트 처리 (PATCH용)
app.options("/notion/like/:id", cors());

// 2. Body 파싱
app.use(express.json());

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const databaseId = process.env.NOTION_DATABASE_ID as string;

app.get("/notion", async (req: Request, res: Response) => {
  try {
    const db = await notion.databases.retrieve({ database_id: databaseId });
    const query = await notion.databases.query({ database_id: databaseId });

    res.json({ db, query });
  } catch (error) {
    console.error("Notion API error:", error);
    res.status(500).send("Error fetching Notion data");
  }
});

app.post("/notion/like/:id", async (req: Request, res: Response) => {
  console.log("post 요청 도달:", req.params.id);
  const pageId = req.params.id;

  try {
    // 먼저 해당 페이지의 현재 데이터를 가져와서 likes 수를 확인
    const page = (await notion.pages.retrieve({ page_id: pageId })) as any;

    const currentLikes = page.properties["likes"]?.number ?? 0;

    // likes +1로 업데이트
    await notion.pages.update({
      page_id: pageId,
      properties: {
        likes: {
          number: currentLikes + 1,
        },
      },
    });

    res.json({ success: true, updatedLikes: currentLikes + 1 });
  } catch (error) {
    console.error("Error updating likes:", error);
    res.status(500).json({ error: "Failed to update likes" });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
