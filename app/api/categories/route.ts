import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { COOKIE_NAME, verifySessionToken } from "@/lib/auth";

const projectRoot = path.resolve(process.cwd(), "..");

const sectionPaths: Record<string, string> = {
  documentation: "docs",
  sop: "sops",
  troubleshooting: "troubleshooting",
};

function getSectionPath(section: string) {
  const folder = sectionPaths[section];

  if (!folder) {
    throw new Error("Invalid section.");
  }

  return path.join(projectRoot, folder);
}

function getCategories(section?: string) {
  const sections = section
    ? { [section]: sectionPaths[section] }
    : sectionPaths;

  const categories: {
    id: string;
    name: string;
    section: string;
  }[] = [];

  for (const [sectionName, folder] of Object.entries(sections)) {
    if (!folder) continue;

    const sectionPath = path.join(projectRoot, folder);

    if (!fs.existsSync(sectionPath)) {
      continue;
    }

    const entries = fs.readdirSync(sectionPath, {
      withFileTypes: true,
    });

    for (const entry of entries) {
      if (!entry.isDirectory()) {
        continue;
      }

      if (entry.name.toLowerCase() === "intro") {
        continue;
      }

      categories.push({
        id: `${folder}/${entry.name}`,
        name: entry.name,
        section: sectionName,
      });
    }
  }

  return categories.sort((a, b) =>
    a.name.localeCompare(b.name)
  );
}

function getToken(request: Request) {
  return request.headers
    .get("cookie")
    ?.split(";")
    .find((cookie) =>
      cookie.trim().startsWith(`${COOKIE_NAME}=`)
    )
    ?.split("=")
    .slice(1)
    .join("=");
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const section = searchParams.get("section") || undefined;

    if (section && !sectionPaths[section]) {
      return NextResponse.json(
        { error: "Invalid section." },
        { status: 400 }
      );
    }

    const categories = getCategories(section);

    const id = searchParams.get("id");

    if (id) {
      const category = categories.find(
        (item) => item.id === id
      );

      if (!category) {
        return NextResponse.json(
          { error: "Category not found." },
          { status: 404 }
        );
      }

      return NextResponse.json(category);
    }

    return NextResponse.json(categories);
  } catch (error) {
    console.error("GET CATEGORIES ERROR:", error);

    return NextResponse.json(
      { error: "Failed to load categories." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const token = getToken(request);

    if (!(await verifySessionToken(token))) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const name = String(body.name || "").trim();
    const section = String(body.section || "").trim();

    if (!name) {
      return NextResponse.json(
        { error: "Category name is required." },
        { status: 400 }
      );
    }

    if (!section || !sectionPaths[section]) {
      return NextResponse.json(
        { error: "Valid section is required." },
        { status: 400 }
      );
    }

    const sectionPath = getSectionPath(section);
    const categoryPath = path.join(sectionPath, name);

    if (fs.existsSync(categoryPath)) {
      return NextResponse.json(
        { error: "Category already exists." },
        { status: 409 }
      );
    }

    fs.mkdirSync(categoryPath, { recursive: true });

    return NextResponse.json(
      {
        id: `${sectionPaths[section]}/${name}`,
        name,
        section,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("CREATE CATEGORY ERROR:", error);

    return NextResponse.json(
      { error: "Failed to create category." },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const token = getToken(request);

    if (!(await verifySessionToken(token))) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Category ID is required." },
        { status: 400 }
      );
    }

    const body = await request.json();

    const name = String(body.name || "").trim();
    const section = String(body.section || "").trim();

    if (!name) {
      return NextResponse.json(
        { error: "Category name is required." },
        { status: 400 }
      );
    }

    if (!section || !sectionPaths[section]) {
      return NextResponse.json(
        { error: "Valid section is required." },
        { status: 400 }
      );
    }

    const oldParts = id.split("/");

    if (oldParts.length !== 2) {
      return NextResponse.json(
        { error: "Invalid category ID." },
        { status: 400 }
      );
    }

    const oldSectionFolder = oldParts[0];
    const oldName = oldParts[1];

    const oldSection = Object.entries(sectionPaths).find(
      ([, folder]) => folder === oldSectionFolder
    )?.[0];

    if (!oldSection) {
      return NextResponse.json(
        { error: "Invalid category path." },
        { status: 400 }
      );
    }

    const oldPath = path.join(
      projectRoot,
      oldSectionFolder,
      oldName
    );

    const newPath = path.join(
      projectRoot,
      sectionPaths[section],
      name
    );

    if (!fs.existsSync(oldPath)) {
      return NextResponse.json(
        { error: "Category not found." },
        { status: 404 }
      );
    }

    if (
      oldPath !== newPath &&
      fs.existsSync(newPath)
    ) {
      return NextResponse.json(
        { error: "Target category already exists." },
        { status: 409 }
      );
    }

    fs.mkdirSync(
      path.dirname(newPath),
      { recursive: true }
    );

    fs.renameSync(oldPath, newPath);

    return NextResponse.json({
      id: `${sectionPaths[section]}/${name}`,
      name,
      section,
    });
  } catch (error) {
    console.error("UPDATE CATEGORY ERROR:", error);

    return NextResponse.json(
      { error: "Failed to update category." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const token = getToken(request);

    if (!(await verifySessionToken(token))) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Category ID is required." },
        { status: 400 }
      );
    }

    const parts = id.split("/");

    if (parts.length !== 2) {
      return NextResponse.json(
        { error: "Invalid category ID." },
        { status: 400 }
      );
    }

    const folder = parts[0];
    const name = parts[1];

    const section = Object.entries(sectionPaths).find(
      ([, value]) => value === folder
    )?.[0];

    if (!section) {
      return NextResponse.json(
        { error: "Invalid category path." },
        { status: 400 }
      );
    }

    const categoryPath = path.join(
      projectRoot,
      folder,
      name
    );

    if (!fs.existsSync(categoryPath)) {
      return NextResponse.json(
        { error: "Category not found." },
        { status: 404 }
      );
    }

    const entries = fs.readdirSync(categoryPath);

    if (entries.length > 0) {
      return NextResponse.json(
        {
          error:
            "Category is not empty. Move or delete its articles first.",
        },
        { status: 409 }
      );
    }

    fs.rmdirSync(categoryPath);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("DELETE CATEGORY ERROR:", error);

    return NextResponse.json(
      { error: "Failed to delete category." },
      { status: 500 }
    );
  }
}