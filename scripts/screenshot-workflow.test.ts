import { describe, expect, it } from "vitest";
import {
  buildBackupDirectoryName,
  compareScreenshotManifests,
  createScreenshotManifest,
  isScreenshotFile,
  type ScreenshotFileInfo,
} from "./screenshot-workflow-lib";

describe("isScreenshotFile", () => {
  it("accepts png files inside metadata root", () => {
    expect(isScreenshotFile("metadata/reverse-shell-generator-1.png")).toBe(true);
  });

  it("rejects non-png files and nested backup files", () => {
    expect(isScreenshotFile("metadata/readme.md")).toBe(false);
    expect(isScreenshotFile("metadata/backups/20260323-120000/reverse-shell-generator-1.png")).toBe(false);
  });
});

describe("buildBackupDirectoryName", () => {
  it("formats the timestamp as a compact local folder name", () => {
    const date = new Date(2026, 2, 23, 5, 40, 9);
    expect(buildBackupDirectoryName(date)).toBe("20260323-054009");
  });
});

describe("createScreenshotManifest", () => {
  it("indexes files by basename for later comparison", () => {
    const files: ScreenshotFileInfo[] = [
      { path: "metadata/reverse-shell-generator-1.png", name: "reverse-shell-generator-1.png", size: 100, sha256: "a" },
      { path: "metadata/reverse-shell-generator-2.png", name: "reverse-shell-generator-2.png", size: 200, sha256: "b" },
    ];

    expect(createScreenshotManifest(files)).toEqual({
      "reverse-shell-generator-1.png": files[0],
      "reverse-shell-generator-2.png": files[1],
    });
  });
});

describe("compareScreenshotManifests", () => {
  it("detects changed, added, removed, and unchanged screenshots", () => {
    const before = createScreenshotManifest([
      { path: "metadata/reverse-shell-generator-1.png", name: "reverse-shell-generator-1.png", size: 100, sha256: "same" },
      { path: "metadata/reverse-shell-generator-2.png", name: "reverse-shell-generator-2.png", size: 200, sha256: "old" },
      { path: "metadata/reverse-shell-generator-3.png", name: "reverse-shell-generator-3.png", size: 300, sha256: "gone" },
    ]);

    const after = createScreenshotManifest([
      { path: "metadata/reverse-shell-generator-1.png", name: "reverse-shell-generator-1.png", size: 100, sha256: "same" },
      { path: "metadata/reverse-shell-generator-2.png", name: "reverse-shell-generator-2.png", size: 240, sha256: "new" },
      { path: "metadata/reverse-shell-generator-4.png", name: "reverse-shell-generator-4.png", size: 400, sha256: "added" },
    ]);

    expect(compareScreenshotManifests(before, after)).toEqual({
      changed: ["reverse-shell-generator-2.png"],
      unchanged: ["reverse-shell-generator-1.png"],
      added: ["reverse-shell-generator-4.png"],
      removed: ["reverse-shell-generator-3.png"],
    });
  });
});
