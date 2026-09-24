import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import matter from "gray-matter";

const docsPath = path.resolve(process.cwd(), "..", "docs");

function getSafeFilePath(fileName: string) {
  const safeName = path.basename(fileName);

  if (!safeName.endsWith(".md")) {
    throw new Error("Invalid file name.");
  }

  return path.join(docsPath, safeName);
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fileName = searchParams.get("file");

    // Get single article
    if (fileName) {
      const filePath = getSafeFilePath(fileName);

      if (!fs.existsSync(filePath)) {
        return NextResponse.json(
          { error: "Article not found." },
          { status: 404 }
        );
      }

      const raw = fs.readFileSync(filePath, "utf-8");
      const { data, content } = matter(raw);

      return NextResponse.json({
        title: data.title || fileName.replace(/\.md$/, ""),
        category: data.category || "Uncategorized",
        type: data.type || "How-to Guide",
        status: data.status || "Published",
        updated: data.updated || null,
        fileName,
        content,
      });
    }

    // Get all articles
    const files = fs
      .readdirSync(docsPath)
      .filter((file) => file.endsWith(".md"));

    const articles = files.map((fileName) => {
      const filePath = path.join(docsPath, fileName);
      const raw = fs.readFileSync(filePath, "utf-8");

      const { data, content } = matter(raw);

      return {
        title: data.title || fileName.replace(/\.md$/, ""),
        category: data.category || "Uncategorized",
        type: data.type || "How-to Guide",
        status: data.status || "Published",
        updated: data.updated || null,
        fileName,
        content,
      };
    });

    return NextResponse.json(articles);
  } catch (error) {
    console.error("GET articles error:", error);

    return NextResponse.json(
      { error: "Failed to load articles." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      title,
      category,
      type,
      status,
      content,
    } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required." },
        { status: 400 }
      );
    }

    if (!fs.existsSync(docsPath)) {
      fs.mkdirSync(docsPath, { recursive: true });
    }

    const fileName = `${title.trim()}.md`;
    const filePath = getSafeFilePath(fileName);

    if (fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: "An article with this title already exists." },
        { status: 409 }
      );
    }

    const frontmatter = {
      title: title.trim(),
      category: category || "Uncategorized",
      type: type || "How-to Guide",
      status: status || "Draft",
      updated: new Date().toISOString(),
    };

    const markdown = matter.stringify(
      content.trim(),
      frontmatter
    );

    fs.writeFileSync(filePath, markdown, "utf-8");

    return NextResponse.json(
      {
        success: true,
        message: "Article created successfully.",
        fileName,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST articles error:", error);

    return NextResponse.json(
      { error: "Failed to create article." },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    const {
      fileName,
      title,
      category,
      type,
      status,
      content,
    } = body;

    if (!fileName) {
      return NextResponse.json(
        { error: "File name is required." },
        { status: 400 }
      );
    }

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required." },
        { status: 400 }
      );
    }

    const oldFilePath = getSafeFilePath(fileName);

    if (!fs.existsSync(oldFilePath)) {
      return NextResponse.json(
        { error: "Article not found." },
        { status: 404 }
      );
    }

    const newFileName = fileName;
    const newFilePath = getSafeFilePath(newFileName);

    // Prevent accidental overwrite of another article
    if (
      oldFilePath !== newFilePath &&
      fs.existsSync(newFilePath)
    ) {
      return NextResponse.json(
        { error: "Another article with this title already exists." },
        { status: 409 }
      );
    }

    const frontmatter = {
      title: title.trim(),
      category: category || "Uncategorized",
      type: type || "How-to Guide",
      status: status || "Draft",
      updated: new Date().toISOString(),
    };

    const markdown = matter.stringify(
      content.trim(),
      frontmatter
    );

    fs.writeFileSync(newFilePath, markdown, "utf-8");

       return NextResponse.json({
      success: true,
      message: "Article updated successfully.",
      fileName: newFileName,
    });
  } catch (error) {
    console.error("PUT articles error:", error);

    return NextResponse.json(
      { error: "Failed to update article." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fileName = searchParams.get("file");

    if (!fileName) {
      return NextResponse.json(
        { error: "File name is required." },
        { status: 400 }
      );
    }

    const filePath = getSafeFilePath(fileName);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: "Article not found." },
        { status: 404 }
      );
    }

    fs.unlinkSync(filePath);

    return NextResponse.json({
      success: true,
      message: "Article deleted successfully.",
      fileName,
    });
  } catch (error) {
    console.error("DELETE articles error:", error);

    return NextResponse.json(
      { error: "Failed to delete article." },
      { status: 500 }
    );
  }
}