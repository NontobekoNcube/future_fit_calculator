import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

let aiInstance: GoogleGenAI | null = null;

function getAI(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required. Please set it in the Secrets panel.");
    }
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiInstance;
}

// 1. Calculate study/degree relevance endpoint
app.post("/api/calculate-relevance", async (req, res) => {
  try {
    const { degree, country, skills, goals } = req.body;
    if (!degree || !country) {
      return res.status(400).json({ error: "Degree and country are required." });
    }

    const ai = getAI();

    // Constructing a detailed prompt that forces a JSON schema response
    // Using search grounding to get actual, real-time demand in 2026 for Kenya, Nigeria, or South Africa
    const query = `Analyze the current industry relevance, demand, salary projections, and career path for a degree in "${degree}" in the country "${country}". Current skills of the student: "${skills || "None specified"}". Goals: "${goals || "General career growth"}".
    Use real-time, actual job market data, salary surveys, hiring sectors, and local job portals for ${country} in 2026.
    
    You MUST return the response strictly in JSON format matching this schema:
    {
      "relevanceScore": number (value from 0 to 100 representing market alignment),
      "demandIndex": "High" | "Medium" | "Low",
      "growthFiveYears": "string describing growth percentage/outlook",
      "marketOverview": "string (2-3 sentences overview of the current job market for this degree in ${country})",
      "salaryLocal": {
        "min": number (annual min salary in local currency: KES for Kenya, NGN for Nigeria, ZAR for South Africa),
        "max": number (annual max salary in local currency),
        "median": number (annual median salary in local currency),
        "currency": "string (KES, NGN, or ZAR)",
        "period": "annual"
      },
      "salaryUSD": {
        "min": number (annual USD equivalent),
        "max": number (annual USD equivalent),
        "median": number (annual USD equivalent)
      },
      "hiringSectors": ["string list of top 3-4 hiring sectors/industries"],
      "topInDemandSkills": ["string list of top 4-5 skills employers are actively looking for"],
      "skillGaps": ["string list of 3 skill gaps between standard curriculum of this degree and actual market requirements"],
      "googleOfferings": [
        {
          "title": "string name of Google Certificate or tool (e.g., Google Data Analytics Certificate, Google Cloud Skills Boost, Google Project Management, etc.)",
          "category": "string category (e.g., Certificates, Cloud Training, Developer Groups)",
          "reason": "string explaining how this specifically bridges the gaps identified"
        }
      ],
      "localResources": [
        {
          "title": "string (e.g., Google Developer Student Clubs - GDSC)",
          "type": "string (e.g., Community, Hub, Platform)",
          "description": "string (how to join or use this Google resource locally in ${country})"
        }
      ]
    }`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: query,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        systemInstruction: `You are an expert academic advisor and regional job market analyst specializing in African tech, finance, engineering, and business landscapes (specifically Kenya, Nigeria, and South Africa).
        You use search grounding to fetch the absolute latest (2026) salary figures, popular local hiring trends, and actual career certificates or Google programs that help African students succeed.
        Return ONLY valid JSON matching the requested structure. Do not wrap the JSON in Markdown backticks.`,
      },
    });

    const text = response.text || "{}";
    const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const data = JSON.parse(cleanedText);

    // Capture search grounding sources if available
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const searchSources = chunks
      ? chunks
          .map((c: any) => ({
            title: c.web?.title || "Market Source",
            uri: c.web?.uri || "",
          }))
          .filter((s: any) => s.uri)
      : [];

    res.json({ ...data, searchSources });
  } catch (error: any) {
    console.error("Relevance calculation error:", error);
    res.status(500).json({ error: error.message || "Failed to analyze study relevance." });
  }
});

// 2. Student Companion Flashcard/Quiz generator
app.post("/api/generate-quiz", async (req, res) => {
  try {
    const { topic, country } = req.body;
    if (!topic) {
      return res.status(400).json({ error: "Topic is required." });
    }

    const ai = getAI();
    const prompt = `Generate a high-quality study quiz about "${topic}" suitable for a student in ${country || "Africa"}. 
    Provide exactly 5 multiple-choice questions.
    Return strictly a JSON array of objects, with no markdown formatting:
    [
      {
        "question": "string question text",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "answerIndex": number (0-3 representing the correct option),
        "explanation": "string explaining why this is correct"
      }
    ]`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        systemInstruction: "You are an educational tutor. Return strictly JSON matching the format, no extra text.",
      },
    });

    const text = response.text || "[]";
    const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    res.json(JSON.parse(cleanedText));
  } catch (error: any) {
    console.error("Quiz generation error:", error);
    res.status(500).json({ error: error.message || "Failed to generate study quiz." });
  }
});

// 3. AI Study Planner endpoint
app.post("/api/study-planner", async (req, res) => {
  try {
    const { subject, examDate, hoursPerDay } = req.body;
    if (!subject) {
      return res.status(400).json({ error: "Subject is required." });
    }

    const ai = getAI();
    const prompt = `Create a highly organized study plan for "${subject}". The exam is on ${examDate || "in 2 weeks"}. The student can study ${hoursPerDay || 2} hours per day.
    Provide a day-by-day roadmap (for 7 days) detailing:
    Return strictly a JSON array of 7 objects (representing a 7-day sprint):
    [
      {
        "day": number,
        "topics": ["topic 1", "topic 2"],
        "dynamicTips": "practical recommendation for active recall or study method",
        "tasks": ["concrete actionable study task 1", "task 2"]
      }
    ]`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        systemInstruction: "You are a professional academic coach. You design highly structured study plans optimized for maximum retrieval strength.",
      },
    });

    const text = response.text || "[]";
    const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    res.json(JSON.parse(cleanedText));
  } catch (error: any) {
    console.error("Planner generation error:", error);
    res.status(500).json({ error: error.message || "Failed to create study plan." });
  }
});

// 4. Note Summarizer & Mind Map
app.post("/api/summarize-notes", async (req, res) => {
  try {
    const { notes } = req.body;
    if (!notes) {
      return res.status(400).json({ error: "Notes content is required." });
    }

    const ai = getAI();
    const prompt = `Analyze, summarize and generate a structured conceptual mind map outline for these study notes:
    
    "${notes}"
    
    Return strictly a JSON object:
    {
      "summary": "detailed markdown summary of the text using clean bullet points and headings",
      "keyTakeaways": ["takeaway 1", "takeaway 2", "takeaway 3"],
      "mindmap": [
        {
          "topic": "Main core branch",
          "subtopics": ["sub-node A", "sub-node B", "sub-node C"]
        }
      ]
    }`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        systemInstruction: "You are a learning science expert. You turn unstructured messy notes into pristine summaries and hierarchical mind map branches for visual learning.",
      },
    });

    const text = response.text || "{}";
    const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    res.json(JSON.parse(cleanedText));
  } catch (error: any) {
    console.error("Summarizer error:", error);
    res.status(500).json({ error: error.message || "Failed to summarize notes." });
  }
});

// Express serving client app logic
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
