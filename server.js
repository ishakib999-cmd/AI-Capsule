require("dotenv").config();

const express = require("express");
const path = require("path");
const db = require("./db");

const passport = require("passport");
const GitHubStrategy = require("passport-github2").Strategy;
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL:
  process.env.NODE_ENV === "production"
    ? "https://ai-capsule-wihw.onrender.com/auth/github/callback"
    : "http://localhost:3000/auth/github/callback",
    },
    (accessToken, refreshToken, profile, done) => {
      return done(null, profile);
    }
  )
);
app.get(
  "/login",
  passport.authenticate("github", { session: false })
);

app.get(
  "/auth/github/callback",
  passport.authenticate("github", {
    session: false,
    failureRedirect: "/",
  }),
  (req, res) => {
    const token = jwt.sign(
      {
        user_id: String(req.user.id),
        username: req.user.username,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    res.redirect(
  process.env.NODE_ENV === "production"
    ? "https://ai-capsule-wihw.onrender.com"
    : "http://localhost:5173"
);
  }
);

function authenticateToken(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Unauthorized" });
  }
}

// GET all capsule records
app.get("/api/capsules", authenticateToken, (req, res) => {
db.all(
  "SELECT * FROM capsules WHERE user_id = ?",
  [req.user.user_id],
  (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json(rows);
  });
  }
);

// UPDATE a capsule record
app.put("/api/capsules/:id", authenticateToken, (req, res) => {
  const { id } = req.params;

  const {
    project_name,
    prompt_title,
    prompt_version,
    prompt_text,
    response_summary,
    category,
    usefulness,
    reviewed,
    improved,
    screenshot_url,
    notes
  } = req.body;

  const sql = `
    UPDATE capsules
    SET project_name = ?,
        prompt_title = ?,
        prompt_version = ?,
        prompt_text = ?,
        response_summary = ?,
        category = ?,
        usefulness = ?,
        reviewed = ?,
        improved = ?,
        screenshot_url = ?,
        notes = ?
    WHERE id = ? AND user_id = ?
  `;

  db.run(
    sql,
    [
      project_name,
      prompt_title,
      prompt_version,
      prompt_text,
      response_summary,
      category,
      usefulness,
      reviewed ? 1 : 0,
      improved ? 1 : 0,
      screenshot_url,
      notes,
id,
req.user.user_id
    ],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.json({ message: "Capsule updated successfully" });
    }
  );
});



// CREATE a capsule record
app.post("/api/capsules", authenticateToken, (req, res) => {
  const {
    project_name,
    prompt_title,
    prompt_version,
    prompt_text,
    response_summary,
    category,
    usefulness,
    reviewed,
    improved,
    screenshot_url,
    notes
  } = req.body;

  const sql = `
    INSERT INTO capsules (
      user_id, project_name, prompt_title, prompt_version,
      prompt_text, response_summary, category, usefulness,
      reviewed, improved, screenshot_url, notes
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(
    sql,
    [
      req.user.user_id,
project_name,
      prompt_title,
      prompt_version,
      prompt_text,
      response_summary,
      category,
      usefulness,
      reviewed ? 1 : 0,
      improved ? 1 : 0,
      screenshot_url,
      notes
    ],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.status(201).json({
        id: this.lastID,
        message: "Capsule created successfully"
      });
    }
  );
});

// Public health check required by the assignment
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// DELETE a capsule record
app.delete("/api/capsules/:id", authenticateToken, (req, res) => {
  const { id } = req.params;

  db.run(
    "DELETE FROM capsules WHERE id = ?",
    [id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.json({ message: "Capsule deleted successfully" });
    }
  );
});

// Serve React frontend in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "client", "dist")));

  app.use((req, res, next) => {
    if (req.method === "GET" && !req.path.startsWith("/api") && !req.path.startsWith("/auth")) {
      return res.sendFile(path.join(__dirname, "client", "dist", "index.html"));
    }
    next();
  });
}

app.listen(PORT, () => {
  console.log(`AI Capsule server running on port ${PORT}`);
});