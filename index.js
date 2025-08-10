import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

let drafts = [];
let characters = [];

// Helper: AI analysis (optional)
async function analyzeWithAI(prompt) {
  const apiKey = process.env.OPENAI_API_KEY; // Optional key in Render
  if (!apiKey) return "AI not enabled.";
  
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }]
      })
    });

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "No AI response.";
  } catch (err) {
    console.error(err);
    return "AI request failed.";
  }
}

// Create a new draft
app.post("/draft", (req, res) => {
  const { name, participants } = req.body;
  const newDraft = { id: drafts.length + 1, name, participants, picks: [] };
  drafts.push(newDraft);
  res.json(newDraft);
});

// Get all drafts
app.get("/drafts", (req, res) => {
  res.json(drafts);
});

// Add pick to draft
app.post("/draft/:id/pick", (req, res) => {
  const draft = drafts.find(d => d.id == req.params.id);
  if (!draft) return res.status(404).json({ error: "Draft not found" });

  draft.picks.push(req.body);
  res.json(draft);
});

// Add a character to the database
app.post("/character", (req, res) => {
  characters.push(req.body);
  res.json({ message: "Character added", character: req.body });
});

// Search characters
app.get("/character/search", (req, res) => {
  const query = req.query.q?.toLowerCase();
  const results = characters.filter(c => c.name.toLowerCase().includes(query));
  res.json(results);
});

// Analyze draft with AI
app.post("/analyze", async (req, res) => {
  const { prompt } = req.body;
  const result = await analyzeWithAI(prompt);
  res.json({ analysis: result });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
