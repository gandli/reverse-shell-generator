export interface ScreenshotFileInfo {
  path: string;
  name: string;
  size: number;
  sha256: string;
}

export interface ScreenshotManifest {
  [filename: string]: ScreenshotFileInfo;
}

export interface ScreenshotDiff {
  changed: string[];
  unchanged: string[];
  added: string[];
  removed: string[];
}

export function isScreenshotFile(filePath: string): boolean {
  return /^metadata\/[^/]+\.png$/u.test(filePath);
}

function pad(value: number): string {
  return value.toString().padStart(2, "0");
}

export function buildBackupDirectoryName(date: Date): string {
  return [
    date.getFullYear().toString(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
    "-",
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds()),
  ].join("");
}

export function createScreenshotManifest(files: ScreenshotFileInfo[]): ScreenshotManifest {
  return Object.fromEntries(files.map((file) => [file.name, file]));
}

export function compareScreenshotManifests(before: ScreenshotManifest, after: ScreenshotManifest): ScreenshotDiff {
  const names = [...new Set([...Object.keys(before), ...Object.keys(after)])].sort();

  const diff: ScreenshotDiff = {
    changed: [],
    unchanged: [],
    added: [],
    removed: [],
  };

  for (const name of names) {
    const previous = before[name];
    const next = after[name];

    if (!previous && next) {
      diff.added.push(name);
      continue;
    }

    if (previous && !next) {
      diff.removed.push(name);
      continue;
    }

    if (previous && next) {
      if (previous.sha256 === next.sha256 && previous.size === next.size) {
        diff.unchanged.push(name);
      } else {
        diff.changed.push(name);
      }
    }
  }

  return diff;
}
