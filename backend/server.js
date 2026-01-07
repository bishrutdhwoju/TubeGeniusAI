import express from "express";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

const __dirname = path.resolve();

app.use(express.json());

// Serve static assets
app.use(express.static(path.join(__dirname, "frontend", "dist")));

// SPA fallback — Express 5 SAFE
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "dist", "index.html"));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
