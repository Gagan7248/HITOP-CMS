import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { execFileSync } from "child_process";
import { COOKIE_NAME, verifySessionToken } from "@/lib/auth";

export const runtime = "nodejs";

/* =========================
   PROJECT PATHS
========================= */

const projectRoot = path.resolve(process.cwd(), "..");

const sectionPaths: Record<string, string> = {
  documentation: "docs",
  sop: "sops",
  troubleshooting: "troubleshooting",
};

/* =========================
   SECTION HELPERS
========================= */

function getSectionFolder(section: string) {
  return sectionPaths[section] || "docs";
}

function getSectionPath(section: string) {
  return path.join(
    projectRoot,
    getSectionFolder(section)
  );
}

/* =========================
   CATEGORY HELPERS
========================= */

function sanitizeCategory(category: string) {
  const safeCategory = category
    .trim()
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, "")
    .replace(/\s+/g, " ")
    .replace(/\.+$/g, "");

  if (!safeCategory) {
    throw new Error("Invalid category.");
  }

  return safeCategory;
}

function getCategoryPath(
  section: string,
  category: string
) {
  return path.join(
    getSectionPath(section),
    sanitizeCategory(category)
  );
}

/* =========================
   FILE NAME
========================= */

function createSafeFileName(title: string) {
  const safeName = title
    .trim()
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, "")
    .replace(/\s+/g, " ")
    .replace(/\.+$/g, "");

  if (!safeName) {
    throw new Error("Invalid article title.");
  }

  return `${safeName}.md`;
}

/* =========================
   SLUG
========================= */

function createBaseSlug(title: string) {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "") ||
    "article"
  );
}

/* =========================
   MARKDOWN
========================= */

function createMarkdown(
  title: string,
  description: string,
  category: string,
  type: string,
  status: string,
  section: string,
  slug: string,
  content: string,
  date: string,
  updated: string
) {
  return matter.stringify(content, {
    title,
    description,
    category,
    type,
    status,
    section,
    slug,
    date,
    updated,
  });
}

/* =========================
   ARTICLE ID
========================= */

function createArticleId(filePath: string) {
  return path
    .relative(projectRoot, filePath)
    .split(path.sep)
    .join("/");
}

function getFilePathFromId(id: string) {
  const normalized = id
    .replace(/\\/g, "/")
    .replace(/^\/+/, "");

  const fullPath = path.resolve(
    projectRoot,
    normalized
  );

  const relative = path.relative(
    projectRoot,
    fullPath
  );

  if (
    relative.startsWith("..") ||
    path.isAbsolute(relative)
  ) {
    throw new Error("Invalid article ID.");
  }

  if (!fullPath.endsWith(".md")) {
    throw new Error("Invalid article file.");
  }

  return fullPath;
}

/* =========================
   READ MARKDOWN FILE
========================= */

function readArticle(filePath: string) {
  const raw = fs.readFileSync(
    filePath,
    "utf-8"
  );

  const { data, content } = matter(raw);

  const stat = fs.statSync(filePath);

  const section =
    data.section ||
    getSectionFromPath(filePath);

  const category =
    data.category ||
    getCategoryFromPath(
      filePath,
      section
    );

  const updated =
    data.updated ||
    data.date ||
    stat.mtime.toISOString();

  const created =
    data.date ||
    updated;

  return {
    id: createArticleId(filePath),
    title: data.title || path.basename(filePath, ".md"),
    description: data.description || "",
    category,
    type: data.type || "",
    status: data.status || "Draft",
    section,
    content,
    created_at: created,
    updated_at: updated,
    slug:
      data.slug ||
      createBaseSlug(
        data.title ||
          path.basename(filePath, ".md")
      ),
  };
}

/* =========================
   SECTION FROM PATH
========================= */

function getSectionFromPath(filePath: string) {
  const relative = path.relative(
    projectRoot,
    filePath
  );

  const firstFolder =
    relative.split(path.sep)[0];

  if (firstFolder === "sops") {
    return "sop";
  }

  if (
    firstFolder ===
    "troubleshooting"
  ) {
    return "troubleshooting";
  }

  return "documentation";
}

/* =========================
   CATEGORY FROM PATH
========================= */

function getCategoryFromPath(
  filePath: string,
  section: string
) {
  const sectionPath =
    getSectionPath(section);

  const relative = path.relative(
    sectionPath,
    filePath
  );

  const parts = relative.split(
    path.sep
  );

  if (parts.length > 1) {
    return parts[0];
  }

  return "General";
}

/* =========================
   FIND MARKDOWN FILES
========================= */

function walkMarkdownFiles(
  directory: string,
  files: string[] = []
) {
  if (!fs.existsSync(directory)) {
    return files;
  }

  const entries =
    fs.readdirSync(directory, {
      withFileTypes: true,
    });

  for (const entry of entries) {
    const fullPath = path.join(
      directory,
      entry.name
    );

    if (entry.isDirectory()) {
      walkMarkdownFiles(
        fullPath,
        files
      );
      continue;
    }

    if (
      entry.isFile() &&
      entry.name.endsWith(".md")
    ) {
      files.push(fullPath);
    }
  }

  return files;
}

/* =========================
   GET ALL ARTICLES
========================= */

function getAllArticles() {
  const articles = [];

  for (const section of Object.keys(
    sectionPaths
  )) {
    const sectionPath =
      getSectionPath(section);

    const files =
      walkMarkdownFiles(
        sectionPath
      );

    for (const filePath of files) {
      try {
        const article =
          readArticle(filePath);

        if (article.title) {
          articles.push(article);
        }
      } catch (error) {
        console.error(
          "Failed to read article:",
          filePath,
          error
        );
      }
    }
  }

  articles.sort(
    (a, b) =>
      new Date(b.updated_at).getTime() -
      new Date(a.updated_at).getTime()
  );

  return articles;
}

/* =========================
   SYNC ARTICLES.JSON
========================= */

function syncArticlesJson() {
  const scriptPath = path.join(
    projectRoot,
    "scripts",
    "generate-articles.mjs"
  );

  if (!fs.existsSync(scriptPath)) {
    throw new Error(
      `Article generator not found: ${scriptPath}`
    );
  }

  console.log(
    "SYNCING articles.json..."
  );

  execFileSync(
    process.execPath,
    [scriptPath],
    {
      cwd: projectRoot,
      stdio: "inherit",
    }
  );

  console.log(
    "articles.json sync completed."
  );
}

/* =========================
   AUTH
========================= */

async function isAuthorized(
  request: Request
) {
  const token = request.headers
    .get("cookie")
    ?.split(";")
    .find((cookie) =>
      cookie
        .trim()
        .startsWith(
          `${COOKIE_NAME}=`
        )
    )
    ?.split("=")
    .slice(1)
    .join("=");

  return verifySessionToken(token);
}

/* =========================
   GET
========================= */

export async function GET(
  request: Request
) {
  try {
    const { searchParams } =
      new URL(request.url);

    const id =
      searchParams.get("id");

    /* =========================
       SINGLE ARTICLE
    ========================= */

    if (id) {
      let filePath: string;

      try {
        filePath =
          getFilePathFromId(id);
      } catch {
        return NextResponse.json(
          {
            error:
              "Invalid article ID.",
          },
          { status: 400 }
        );
      }

      if (
        !fs.existsSync(filePath)
      ) {
        return NextResponse.json(
          {
            error:
              "Article not found.",
          },
          { status: 404 }
        );
      }

      const article =
        readArticle(filePath);

      return NextResponse.json(
        article
      );
    }

    /* =========================
       ALL ARTICLES
    ========================= */

    const articles =
      getAllArticles();

    return NextResponse.json(
      articles
    );
  } catch (error) {
    console.error(
      "GET articles error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to load articles.",
      },
      { status: 500 }
    );
  }
}

/* =========================
   POST
   CREATE ARTICLE
========================= */

export async function POST(
  request: Request
) {
  if (
    !(await isAuthorized(request))
  ) {
    return NextResponse.json(
      {
        error: "Unauthorized",
      },
      { status: 401 }
    );
  }

  let filePath = "";

  try {
    const body =
      await request.json();

    const title = String(
      body.title || ""
    ).trim();

    const description =
      String(
        body.description || ""
      ).trim();

    const category =
      String(
        body.category ||
          "Uncategorized"
      ).trim();

    const type = String(
      body.type ||
        "How-to Guide"
    ).trim();

    const status =
      String(
        body.status || "Draft"
      ).trim();

    const section =
      String(
        body.section ||
          "documentation"
      ).trim();

    const content =
      String(
        body.content || ""
      ).trim();

    if (!title || !content) {
      return NextResponse.json(
        {
          error:
            "Title and content are required.",
        },
        { status: 400 }
      );
    }

    if (!sectionPaths[section]) {
      return NextResponse.json(
        {
          error:
            "Invalid section.",
        },
        { status: 400 }
      );
    }

    /* =========================
       UNIQUE SLUG
    ========================= */

    const existingArticles =
      getAllArticles();

    const baseSlug =
      createBaseSlug(title);

    let slug = baseSlug;
    let counter = 2;

    while (
      existingArticles.some(
        (article) =>
          article.slug === slug
      )
    ) {
      slug =
        `${baseSlug}-${counter}`;
      counter++;
    }

    /* =========================
       MARKDOWN LOCATION
    ========================= */

    const categoryPath =
      getCategoryPath(
        section,
        category
      );

    if (
      !fs.existsSync(
        categoryPath
      )
    ) {
      fs.mkdirSync(
        categoryPath,
        {
          recursive: true,
        }
      );
    }

    let fileName =
      createSafeFileName(title);

    filePath = path.join(
      categoryPath,
      fileName
    );

    /* =========================
       PREVENT DUPLICATE FILE
    ========================= */

    if (
      fs.existsSync(filePath)
    ) {
      const base =
        path.basename(
          filePath,
          ".md"
        );

      let counter = 2;

      let newPath =
        path.join(
          categoryPath,
          `${base}-${counter}.md`
        );

      while (
        fs.existsSync(newPath)
      ) {
        counter++;

        newPath =
          path.join(
            categoryPath,
            `${base}-${counter}.md`
          );
      }

      filePath = newPath;

      fileName =
        path.basename(
          filePath
        );
    }

    /* =========================
       CREATE MARKDOWN
    ========================= */

    const now =
      new Date().toISOString();

    const markdown =
      createMarkdown(
        title,
        description,
        category,
        type,
        status,
        section,
        slug,
        content,
        now,
        now
      );

    fs.writeFileSync(
      filePath,
      markdown,
      "utf-8"
    );

    console.log(
      "MARKDOWN CREATED:",
      filePath
    );

    /* =========================
       SYNC PORTAL DATA
    ========================= */

    try {
      syncArticlesJson();
    } catch (syncError) {
      console.error(
        "CREATE SYNC ERROR:",
        syncError
      );

      return NextResponse.json(
        {
          error:
            "Article created, but articles.json sync failed.",
          article:
            readArticle(filePath),
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message:
          "Article created successfully.",
        article:
          readArticle(filePath),
        fileName,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "CREATE ARTICLE ERROR:",
      error
    );

    if (
      filePath &&
      fs.existsSync(filePath)
    ) {
      fs.unlinkSync(filePath);
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create article.",
      },
      { status: 500 }
    );
  }
}

/* =========================
   PUT
   UPDATE ARTICLE
========================= */

export async function PUT(
  request: Request
) {
  if (
    !(await isAuthorized(request))
  ) {
    return NextResponse.json(
      {
        error: "Unauthorized",
      },
      { status: 401 }
    );
  }

  try {
    const body =
      await request.json();

    const id = String(
      body.id || ""
    ).trim();

    if (!id) {
      return NextResponse.json(
        {
          error:
            "Article ID is required.",
        },
        { status: 400 }
      );
    }

    let oldFilePath: string;

    try {
      oldFilePath =
        getFilePathFromId(id);
    } catch {
      return NextResponse.json(
        {
          error:
            "Invalid article ID.",
        },
        { status: 400 }
      );
    }

    if (
      !fs.existsSync(
        oldFilePath
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Article not found.",
        },
        { status: 404 }
      );
    }

    /* =========================
       EXISTING ARTICLE
    ========================= */

    const existing =
      readArticle(
        oldFilePath
      );

    /* =========================
       NEW VALUES
    ========================= */

    const title =
      String(
        body.title ??
          existing.title ??
          ""
      ).trim();

    const description =
      String(
        body.description ??
          existing.description ??
          ""
      ).trim();

    const category =
      String(
        body.category ??
          existing.category ??
          "Uncategorized"
      ).trim();

    const type =
      String(
        body.type ??
          existing.type ??
          "How-to Guide"
      ).trim();

    const status =
      String(
        body.status ??
          existing.status ??
          "Draft"
      ).trim();

    const section =
      String(
        body.section ??
          existing.section ??
          "documentation"
      ).trim();

    const content =
      String(
        body.content ??
          existing.content ??
          ""
      ).trim();

    if (!title || !content) {
      return NextResponse.json(
        {
          error:
            "Title and content are required.",
        },
        { status: 400 }
      );
    }

    if (!sectionPaths[section]) {
      return NextResponse.json(
        {
          error:
            "Invalid section.",
        },
        { status: 400 }
      );
    }

    /* =========================
       KEEP SLUG
    ========================= */

    const slug =
      existing.slug ||
      createBaseSlug(title);

    /* =========================
       NEW LOCATION
    ========================= */

    const newCategoryPath =
      getCategoryPath(
        section,
        category
      );

    if (
      !fs.existsSync(
        newCategoryPath
      )
    ) {
      fs.mkdirSync(
        newCategoryPath,
        {
          recursive: true,
        }
      );
    }

    const newFileName =
      createSafeFileName(title);

    const newFilePath =
      path.join(
        newCategoryPath,
        newFileName
      );

    /* =========================
       DUPLICATE CHECK
    ========================= */

    if (
      oldFilePath !==
        newFilePath &&
      fs.existsSync(
        newFilePath
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Another article with this title already exists in this category.",
        },
        { status: 409 }
      );
    }

    /* =========================
       UPDATE MARKDOWN
    ========================= */

    const updated =
      new Date().toISOString();

    const created =
      existing.created_at ||
      updated;

    const markdown =
      createMarkdown(
        title,
        description,
        category,
        type,
        status,
        section,
        slug,
        content,
        created,
        updated
      );

    fs.writeFileSync(
      newFilePath,
      markdown,
      "utf-8"
    );

    console.log(
      "MARKDOWN UPDATED:",
      newFilePath
    );

    /* =========================
       REMOVE OLD FILE
    ========================= */

    if (
      oldFilePath !==
        newFilePath &&
      fs.existsSync(
        oldFilePath
      )
    ) {
      fs.unlinkSync(
        oldFilePath
      );

      console.log(
        "OLD MARKDOWN DELETED:",
        oldFilePath
      );
    }

    /* =========================
       SYNC PORTAL DATA
    ========================= */

    try {
      syncArticlesJson();
    } catch (syncError) {
      console.error(
        "UPDATE SYNC ERROR:",
        syncError
      );

      return NextResponse.json(
        {
          error:
            "Article updated, but articles.json sync failed.",
          article:
            readArticle(
              newFilePath
            ),
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message:
        "Article updated successfully.",
      article:
        readArticle(
          newFilePath
        ),
      fileName: newFileName,
    });
  } catch (error) {
    console.error(
      "UPDATE ARTICLE ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to update article.",
      },
      { status: 500 }
    );
  }
}

/* =========================
   DELETE
========================= */

export async function DELETE(
  request: Request
) {
  if (
    !(await isAuthorized(request))
  ) {
    return NextResponse.json(
      {
        error: "Unauthorized",
      },
      { status: 401 }
    );
  }

  try {
    const { searchParams } =
      new URL(request.url);

    const id =
      searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        {
          error:
            "Article ID is required.",
        },
        { status: 400 }
      );
    }

    let filePath: string;

    try {
      filePath =
        getFilePathFromId(id);
    } catch {
      return NextResponse.json(
        {
          error:
            "Invalid article ID.",
        },
        { status: 400 }
      );
    }

    if (
      !fs.existsSync(filePath)
    ) {
      return NextResponse.json(
        {
          error:
            "Article not found.",
        },
        { status: 404 }
      );
    }

    /* =========================
       DELETE MARKDOWN
    ========================= */

    fs.unlinkSync(
      filePath
    );

    console.log(
      "MARKDOWN DELETED:",
      filePath
    );

    /* =========================
       SYNC PORTAL DATA
    ========================= */

    try {
      syncArticlesJson();
    } catch (syncError) {
      console.error(
        "DELETE SYNC ERROR:",
        syncError
      );

      return NextResponse.json(
        {
          error:
            "Article deleted, but articles.json sync failed.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message:
        "Article deleted successfully.",
    });
  } catch (error) {
    console.error(
      "DELETE ARTICLE ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete article.",
      },
      { status: 500 }
    );
  }
}