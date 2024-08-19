import chokidar from "chokidar";
import { rename } from "fs/promises";
import { extname, join } from "path";

const distDir = "./dist";

const watcher = chokidar.watch(distDir, {
  ignored: /(^|[\/\\])\../, // ignore dotfiles
  persistent: true,
});

watcher.on("add", async (path) => {
  if (extname(path) === ".js") {
    const newPath = path.replace(/\.js$/, ".mjs");
    try {
      await rename(path, newPath);
      console.log(`Renamed: ${path} -> ${newPath}`);
    } catch (err) {
      console.error(`Failed to rename ${path}:`, err);
    }
  }
});

console.log(`Watching for file changes in ${distDir}...`);
