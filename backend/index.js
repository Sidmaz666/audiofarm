// index.js
require("dotenv").config();
const express = require("express");
const compression = require("compression");
const cors = require("cors");
const ytdl = require("@distube/ytdl-core");
const ytSearch = require("yt-search");
const fetch = require("node-fetch").default;
const tunnel = require("tunnel");
const http = require("http");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

// Configure the proxy agent to point to your deployed proxy server
const proxyAgent = tunnel.httpsOverHttp({
  proxy: {
    host: process.env.PROXY_URL || "proxyserve-5fx1.onrender.com", // Your deployed proxy server hostname
    port: process.env.PROXY_PORT || 10000, // Port from the logs
  },
});

// Create a custom HTTP client
const customClient = new http.Agent({
  ...proxyAgent,
});

const ytdlOptions = {
  requestOptions: {
    client: customClient, // Use client for @distube/ytdl-core
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
    },
  },
};

// ======================
//    Global Middleware
// ======================
app.use(compression());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("../frontend/dist"));

// ======================
//         Routes
// ======================
// Search YouTube videos with pagination
app.get("/search", async (req, res, next) => {
  try {
    const { q: query } = req.query;
    let { page = 1, limit = 10 } = req.query;

    // Validate query parameters
    if (!query) {
      return res.status(400).json({ error: "Query (q) is required" });
    }
    page = parseInt(page, 10);
    limit = parseInt(limit, 10);
    if (isNaN(page) || page < 1 || isNaN(limit) || limit < 1) {
      return res
        .status(400)
        .json({ error: "Page and limit must be positive integers" });
    }

    // Fetch results using yt-search
    const results = await ytSearch(query);
    if (!results || !results.videos || !results.videos.length) {
      return res
        .status(404)
        .json({ error: "No videos found for the given query" });
    }

    const allVideos = results.videos.map((video) => ({
      id: video.videoId,
      title: video.title,
      description: video.description,
      thumbnail: video.thumbnail,
      uploadDate: video.ago,
      duration: video.duration.seconds,
    }));

    // Pagination calculations
    const start = (page - 1) * limit;
    const paginatedVideos = allVideos.slice(start, start + limit);

    res.json({
      page,
      limit,
      totalResults: allVideos.length,
      totalPages: Math.ceil(allVideos.length / limit),
      results: paginatedVideos,
    });
  } catch (error) {
    next(error);
  }
});

// Get video information and related videos for /info or /related
app.get(["/info", "/related"], async (req, res, next) => {
  try {
    const { id: videoId } = req.query;
    if (!videoId) {
      return res.status(400).json({ error: "Video ID (id) is required" });
    }
    const results = await ytdl.getInfo(videoId, ytdlOptions);

    if (!results || !results.videoDetails) {
      return res
        .status(404)
        .json({ error: "Video details not found for the given ID" });
    }

    // Delete all the *-watch.html files in the current directory
    const files = fs.readdirSync(__dirname);
    files.forEach((file) => {
      if (file.endsWith("-watch.html")) {
        fs.unlinkSync(path.join(__dirname, file));
      }
    });

    const { videoDetails, related_videos, formats, bestFormat } = results;
    res.json({ videoDetails, related_videos, formats, bestFormat });
  } catch (error) {
    next(error);
  }
});

// Stream YouTube video endpoint
app.get("/stream", async (req, res, next) => {
  try {
    const { id: videoId } = req.query;
    if (!videoId) {
      return res.status(400).json({ error: "Video ID (id) is required" });
    }

    // Fetch video info to get the format URL
    const videoInfo = await ytdl.getInfo(videoId, ytdlOptions);
    if (!videoInfo || !videoInfo.formats) {
      return res.status(404).json({ error: "Video formats not found" });
    }

    // Select format: Prefer itag 18 (360p MP4, video + audio) for reliability
    const format =
      videoInfo.formats.find(
        (fmt) =>
          fmt.itag === 18 &&
          fmt.container === "mp4" &&
          fmt.hasVideo &&
          fmt.hasAudio
      ) ||
      ytdl.chooseFormat(videoInfo.formats, {
        filter: (fmt) =>
          fmt.container === "mp4" && fmt.hasVideo && fmt.hasAudio,
        quality: "highest",
        ...ytdlOptions,
      });

    if (!format) {
      return res
        .status(400)
        .json({ error: "No suitable format found for streaming" });
    }

    const videoUrl = format.url;

    // Fetch video headers to get content length and metadata
    const headResponse = await fetch(videoUrl, { method: "HEAD" });
    const contentLength = headResponse.headers.get("content-length");
    const contentType = headResponse.headers.get("content-type") || "video/mp4";

    if (!contentLength) {
      return res
        .status(500)
        .json({ error: "Unable to determine content length" });
    }

    const range = req.headers.range;

    // Set response headers
    res.setHeader("Content-Type", contentType);
    res.setHeader("Accept-Ranges", "bytes");
    res.setHeader("Cache-Control", "public, max-age=31536000");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("Content-Disposition", "inline"); // Encourage inline playback

    if (!range) {
      // No range request: stream the entire video
      res.setHeader("Content-Length", contentLength);

      const videoStream = await fetch(videoUrl);
      videoStream.body.pipe(res);

      videoStream.body.on("error", (err) => {
        console.error("Video stream error:", err);
        if (!res.headersSent) {
          res.status(500).json({ error: "Failed to stream video" });
        }
      });

      res.on("close", () => {
        videoStream.body.destroy();
      });
    } else {
      // Handle range request
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1]
        ? parseInt(parts[1], 10)
        : parseInt(contentLength, 10) - 1;

      if (
        start >= parseInt(contentLength, 10) ||
        end >= parseInt(contentLength, 10)
      ) {
        res.status(416).set({
          "Content-Range": `bytes */${contentLength}`,
        });
        return res.json({ error: "Requested range not satisfiable" });
      }

      const chunkSize = end - start + 1;
      res.status(206).set({
        "Content-Range": `bytes ${start}-${end}/${contentLength}`,
        "Content-Length": chunkSize,
      });

      const videoStream = await fetch(videoUrl, {
        headers: { Range: `bytes=${start}-${end}` },
      });

      videoStream.body.pipe(res);

      videoStream.body.on("error", (err) => {
        console.error("Video stream error:", err);
        if (!res.headersSent) {
          res.status(500).json({ error: "Failed to stream video" });
        }
      });

      res.on("close", () => {
        videoStream.body.destroy();
      });
    }
  } catch (error) {
    console.error("Stream route error:", error);
    next(error);
  }
});

// 404 Not Found handler for unmatched routes
app.use((req, res, next) => {
  res.sendFile(path.join(__dirname, "../frontend/dist/index.html"), (err) => {
    if (err) {
      res.status(err.status).end();
    }
  });
});

// ======================
//  Global Error Handler
// ======================
app.use((err, req, res, next) => {
  console.error(err.stack);
  // Detailed error message can be avoided in production
  res.status(500).json({ error: "Internal Server Error" });
});

// ======================
//     Start the Server
// ======================
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
