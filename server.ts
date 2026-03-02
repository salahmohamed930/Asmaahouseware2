import express from "express";
import { createServer as createViteServer } from "vite";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Supabase Client
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase: any;
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
} else {
  console.warn("Supabase environment variables are missing. Server-side Supabase features will be disabled.");
}

// Gemini Client for Rasha
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// AI Assistant "Rasha" Endpoint
app.post("/api/ai/chat", async (req, res) => {
  try {
    const { message, history, context } = req.body;
    
    const model = "gemini-3-flash-preview";
    const systemInstruction = `
      أنت "رشا"، مساعدة ذكية في متجر "أسماء للأدوات المنزلية".
      مهمتك هي مساعدة العملاء في العثور على المنتجات المناسبة، الإجابة على استفساراتهم، وزيادة المبيعات بأسلوب ودود ومهني.
      تحدث باللغة العربية فقط بلهجة مصرية مهذبة أو لغة عربية بيضاء.
      سياق المتجر الحالي: ${JSON.stringify(context)}
      دائماً اقترح منتجات بناءً على ما يطلبه العميل.
      إذا سأل العميل عن الأسعار، وضح أن هناك أسعاراً خاصة لتجار الجملة.
    `;

    const response = await genAI.models.generateContent({
      model,
      contents: [
        { role: "user", parts: [{ text: message }] }
      ],
      config: {
        systemInstruction,
      }
    });

    res.json({ reply: response.text });
  } catch (error) {
    console.error("AI Error:", error);
    res.status(500).json({ error: "Failed to get AI response" });
  }
});

// Proxy for Supabase Auth/Functions if needed, but client-side Supabase is usually enough.
// Here we might add specific admin-only endpoints that require service_role.

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile("dist/index.html", { root: "." });
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
