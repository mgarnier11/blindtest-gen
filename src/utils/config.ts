import path from "path";
import fs from "fs";

const createPath = (path: string) => {
  if (!fs.existsSync(path)) fs.mkdirSync(path, { recursive: true });
};

export const outDirPath = path.join(process.cwd(), "out");

export const fadedDirPath = path.join(outDirPath, "faded");
export const tmpDirPath = path.join(outDirPath, "tmp");
export const trackDirPath = path.join(outDirPath, "tracks");

for (const dirPath of [outDirPath, fadedDirPath, tmpDirPath, trackDirPath]) {
  createPath(dirPath);
}
