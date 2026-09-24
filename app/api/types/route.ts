import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { COOKIE_NAME, verifySessionToken } from "@/lib/auth";

const projectRoot = path.resolve(process.cwd(), "..");

const sectionPaths: Record<string, string> = {
  documentation: "docs",
  sop: "sops",
  troubleshooting: "troubleshooting",
};

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

function getTypes(section?: string) {
  const sections = section
    ? { [section]: sectionPaths[section] }
    : sectionPaths;

  const types = new Map<
    string,
    {
      id: string;
      name: string;
      section: string;
    }
  >();

  function scanDirectory(
    directory: string,
    sectionName: string
  ) {
    if (!fs.existsSync(directory)) {
      return;
    }

    const entries = fs.readdirSync(directory, {
      withFileTypes: true,
    });

    for (const entry of entries) {
      const fullPath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        scanDirectory(fullPath, sectionName);
        continue;
      }

      if (!entry.name.endsWith(".md")) {
        continue;
      }

      try {
        const raw = fs.readFileSync(fullPath, "utf-8");
        const { data } = matter(raw);

        const type = String(data.type || "").trim();

        if (!type) {
          continue;
        }

        const key = `${sectionName}:${type}`;

        if (!types.has(key)) {
          types.set(key, {
            id: `${sectionName}:${type}`,
            name: type,
            section: sectionName,
          });
        }
      } catch (error) {
        console.error(
          `Failed to read ${fullPath}:`,
          error
        );
      }
    }
  }

  for (const [sectionName, folder] of Object.entries(
    sections
  )) {
    if (!folder) continue;

    scanDirectory(
      path.join(projectRoot, folder),
      sectionName
    );
  }

  return Array.from(types.values()).sort((a, b) =>
    a.name.localeCompare(b.name)
  );
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

    return NextResponse.json(getTypes(section));
  } catch (error) {
    console.error("GET ARTICLE TYPES ERROR:", error);

    return NextResponse.json(
      { error: "Failed to load article types." },
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
        { error: "Article type name is required." },
        { status: 400 }
      );
    }

    if (!section || !sectionPaths[section]) {
      return NextResponse.json(
        { error: "Valid section is required." },
        { status: 400 }
      );
    }

    const existingTypes = getTypes(section);

    const exists = existingTypes.some(
      (type) =>
        type.name.toLowerCase() === name.toLowerCase()
    );

    if (exists) {
      return NextResponse.json(
        { error: "Article type already exists." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        id: `${section}:${name}`,
        name,
        section,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("CREATE ARTICLE TYPE ERROR:", error);

    return NextResponse.json(
      { error: "Failed to create article type." },
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
        { error: "Article type ID is required." },
        { status: 400 }
      );
    }

    const body = await request.json();

    const name = String(body.name || "").trim();
    const section = String(body.section || "").trim();

    if (!name) {
      return NextResponse.json(
        { error: "Article type name is required." },
        { status: 400 }
      );
    }

    if (!section || !sectionPaths[section]) {
      return NextResponse.json(
        { error: "Valid section is required." },
        { status: 400 }
      );
    }

    /*
     * Article types are metadata values stored inside
     * Markdown frontmatter.
     *
     * Therefore PUT does not create a database record.
     * Existing articles will retain their current type
     * until their frontmatter is changed.
     */

    return NextResponse.json({
      id: `${section}:${name}`,
      name,
      section,
    });
  } catch (error) {
    console.error("UPDATE ARTICLE TYPE ERROR:", error);

    return NextResponse.json(
      { error: "Failed to update article type." },
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
        { error: "Article type ID is required." },
        { status: 400 }
      );
    }

    /*
     * Types are not separate files or database records.
     * They exist in article frontmatter.
     *
     * Therefore DELETE does not remove a type globally.
     * The type disappears automatically when no article
     * uses it anymore.
     */

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("DELETE ARTICLE TYPE ERROR:", error);

    return NextResponse.json(
      { error: "Failed to delete article type." },
      { status: 500 }
    );
  }
}