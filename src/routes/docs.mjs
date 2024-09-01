import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const router = express.Router();

// Serve the index.html file from the docs directory
router.get("/", (req, res) => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const docsDirectory = path.join(__dirname, "../../docs");
  res.sendFile(path.join(docsDirectory, "index.html"));
});

// Serve other documentation files from the docs directory
router.get("/:file", (req, res) => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const docsDirectory = path.join(__dirname, "../../docs");
  const filePath = path.join(docsDirectory, req.params.file);
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error(`Error serving file: ${filePath}`, err);
      res.status(404).send("File not found");
    }
  });
});

export default router;
