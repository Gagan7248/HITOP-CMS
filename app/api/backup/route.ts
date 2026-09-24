import { NextResponse } from "next/server";
import { COOKIE_NAME, verifySessionToken } from "@/lib/auth";
import { createRequire } from "module";
import { PassThrough } from "stream";
import fs from "fs";
import path from "path";

const require = createRequire(import.meta.url);
const archiver = require("archiver");

const projectRoot = path.resolve(process.cwd(), "..");

const backupFolders = [
  "docs",
  "sops",
  "troubleshooting",
  "static",
  "scripts",
  "blog",
  "src",
  ".obsidian",
];

function getSessionToken(request: Request) {
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
    const token = getSessionToken(request);

    if (!(await verifySessionToken(token))) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const passThrough = new PassThrough();
    const chunks: Buffer[] = [];

    passThrough.on("data", (chunk) => {
      chunks.push(Buffer.from(chunk));
    });

    const archive = archiver("zip", {
      zlib: { level: 9 },
    });

    archive.on("error", (error: Error) => {
      passThrough.destroy(error);
    });

    archive.pipe(passThrough);

    const backupInfo = {
      backup_version: 3,
      created_at: new Date().toISOString(),
      source: "HITOP filesystem",
      folders: backupFolders,
      excluded: [
        "node_modules",
        ".docusaurus",
        ".wrangler",
        "build",
        "hitop-cms",
        "src-backup",
      ],
    };

    archive.append(JSON.stringify(backupInfo, null, 2), {
      name: "backup-info.json",
    });

    for (const folder of backupFolders) {
      const folderPath = path.join(projectRoot, folder);

      if (!fs.existsSync(folderPath)) {
        console.warn(`Backup folder not found: ${folderPath}`);
        continue;
      }

      const stat = fs.statSync(folderPath);

      if (!stat.isDirectory()) {
        console.warn(`Backup path is not a directory: ${folderPath}`);
        continue;
      }

      archive.directory(folderPath, folder);
    }

    await archive.finalize();

    await new Promise<void>((resolve, reject) => {
      passThrough.on("end", resolve);
      passThrough.on("error", reject);
    });

    const zipBuffer = Buffer.concat(chunks);

    const date = new Date()
      .toISOString()
      .slice(0, 10);

    return new NextResponse(zipBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="HITOP-Backup-${date}.zip"`,
        "Content-Length": zipBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("BACKUP ERROR:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create backup.",
      },
      { status: 500 }
    );
  }
}