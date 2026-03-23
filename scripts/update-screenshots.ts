import { createHash } from "node:crypto";
import { copyFile, mkdir, readFile, readdir } from "node:fs/promises";
import { join, relative, resolve } from "node:path";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import {
  buildBackupDirectoryName,
  compareScreenshotManifests,
  createScreenshotManifest,
  isScreenshotFile,
  type ScreenshotDiff,
  type ScreenshotFileInfo,
} from "./screenshot-workflow-lib";

const ROOT_DIR = process.cwd();
const METADATA_DIR = resolve(ROOT_DIR, "metadata");
const BACKUPS_DIR = resolve(METADATA_DIR, "backups");

async function walk(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        return walk(fullPath);
      }
      return [fullPath];
    }),
  );

  return nested.flat();
}

async function collectScreenshots(): Promise<ScreenshotFileInfo[]> {
  const files = await walk(METADATA_DIR);
  const screenshotPaths = files
    .map((filePath) => relative(ROOT_DIR, filePath).replaceAll("\\", "/"))
    .filter(isScreenshotFile)
    .sort();

  return Promise.all(
    screenshotPaths.map(async (relativePath) => {
      const absolutePath = resolve(ROOT_DIR, relativePath);
      const contents = await readFile(absolutePath);

      return {
        path: relativePath,
        name: relativePath.split("/").at(-1) ?? relativePath,
        size: contents.byteLength,
        sha256: createHash("sha256").update(contents).digest("hex"),
      };
    }),
  );
}

async function backupScreenshots(files: ScreenshotFileInfo[]): Promise<string> {
  const backupDir = join(BACKUPS_DIR, buildBackupDirectoryName(new Date()));
  await mkdir(backupDir, { recursive: true });

  for (const file of files) {
    await copyFile(resolve(ROOT_DIR, file.path), join(backupDir, file.name));
  }

  return relative(ROOT_DIR, backupDir);
}

function printInstructions(backupDir: string, files: ScreenshotFileInfo[]): void {
  console.log("");
  console.log("截图更新流程已经准备好了。");
  console.log("");
  console.log(`1. 当前截图已备份到: ${backupDir}`);
  console.log("2. 在 Raycast 中打开这个扩展的开发版本。");
  console.log("3. 使用 Raycast 官方 Window Capture。");
  console.log("4. 在截图时勾选 Save to Metadata。");
  console.log("5. 更新完商店截图后，回到这里继续。");
  console.log("");
  console.log("当前检测到的截图:");
  for (const file of files) {
    console.log(`- ${file.name}`);
  }
  console.log("");
}

async function waitForConfirmation(): Promise<void> {
  const rl = readline.createInterface({ input, output });
  try {
    await rl.question("截图更新完成后按回车继续校验...");
  } finally {
    rl.close();
  }
}

function printDiff(diff: ScreenshotDiff): void {
  console.log("");
  console.log("截图变更结果:");

  const sections: Array<[string, string[]]> = [
    ["已更新", diff.changed],
    ["新增", diff.added],
    ["删除", diff.removed],
    ["未变化", diff.unchanged],
  ];

  for (const [label, files] of sections) {
    console.log(`- ${label}: ${files.length === 0 ? "无" : files.join(", ")}`);
  }
}

async function runCommand(command: string[]): Promise<void> {
  const proc = Bun.spawn(command, {
    cwd: ROOT_DIR,
    stdin: "inherit",
    stdout: "inherit",
    stderr: "inherit",
  });

  const exitCode = await proc.exited;
  if (exitCode !== 0) {
    throw new Error(`命令执行失败: ${command.join(" ")}`);
  }
}

async function runChecks(): Promise<void> {
  console.log("");
  console.log("开始运行校验: test -> lint -> build");
  await runCommand(["bun", "run", "test"]);
  await runCommand(["bun", "run", "lint"]);
  await runCommand(["bun", "run", "build"]);
}

async function main(): Promise<void> {
  const beforeFiles = await collectScreenshots();
  if (beforeFiles.length === 0) {
    throw new Error("metadata 目录下没有找到 PNG 截图。");
  }

  const backupDir = await backupScreenshots(beforeFiles);
  printInstructions(backupDir, beforeFiles);
  await waitForConfirmation();

  const afterFiles = await collectScreenshots();
  const diff = compareScreenshotManifests(createScreenshotManifest(beforeFiles), createScreenshotManifest(afterFiles));
  printDiff(diff);

  if (diff.changed.length === 0 && diff.added.length === 0 && diff.removed.length === 0) {
    throw new Error("没有检测到截图变化。请确认你已经用 Save to Metadata 更新了截图。");
  }

  await runChecks();
  console.log("");
  console.log("截图已更新，校验已完成。");
}

await main().catch((error) => {
  console.error("");
  console.error(error instanceof Error ? error.message : "截图流程失败");
  process.exit(1);
});
