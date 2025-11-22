import { GoogleGenAI } from "@google/genai";
import { AppMode } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API_KEY is missing from environment variables");
  }
  return new GoogleGenAI({ apiKey: apiKey || '' });
};

export const sendMessageToGemini = async (
  prompt: string,
  mode: AppMode,
  history: { role: string; parts: { text: string }[] }[]
): Promise<{ text: string; sources?: Array<{ title?: string; uri: string }> }> => {
  const ai = getClient();
  
  // Model Selection
  // Using gemini-2.5-flash for speed and good reasoning capabilities
  const modelName = 'gemini-2.5-flash'; 
  
  let systemInstruction = "";
  
  // Google Search tool is essential for both modes
  // Investor: To find info.
  // Company: To verify info.
  const tools = [{ googleSearch: {} }];

  if (mode === AppMode.INVESTOR) {
    systemInstruction = `You are the Lead Investment Analyst at TrustFundr.
    
    YOUR GOAL:
    Conduct deep, professional due diligence on companies for potential investors.

    PROCESS:
    1. When asked about a company, use Google Search to find:
       - Core Value Proposition
       - Financials (Revenue, Funding, Valuation - if public)
       - Market Sentiment & Recent News
       - Key Risks & Competitors
    2. Structure your response using Markdown headers (##, ###).
    3. Be objective. Highlight red flags clearly.
    4. ALWAYS cite your sources using the grounding tool.
    5. Do not simply summarize the website; look for third-party analysis and news.
    
    TONE:
    Professional, analytical, concise, and data-driven.`;

  } else {
    systemInstruction = `You are the Senior Corporate Auditor at TrustFundr.
    
    YOUR GOAL:
    Interview company representatives, verify their claims, and prepare their profile for our investor database.
    
    PROCESS:
    1. Act as an interviewer. Ask one or two relevant questions at a time (e.g., about revenue, traction, tech stack, team).
    2. When the user provides a fact (e.g., "We just raised Series A", "We have $5M ARR"):
       - IMMEDIATE ACTION: Use Google Search to verify this claim.
       - If verified: State "✅ Verified against public records."
       - If unverified/conflicting: State "⚠️ Could not verify publicly. Please provide a source."
    3. If the user asks to "start" or "audit my company", begin the interview process.
    4. Once you have sufficient information (3-4 turns of verified info), explicitly state: 
       "Compiling data... 
       
       **STATUS: UPLOADED TO TRUSTFUNDR DATABASE 📂**
       
       Investors can now view your verified profile."
    
    TONE:
    Professional, skeptical but polite, thorough.`;
  }

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: [
        ...history.map(h => ({
            role: h.role,
            parts: h.parts
        })),
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ],
      config: {
        systemInstruction,
        tools: tools,
      }
    });

    const text = response.text || "I couldn't generate a response. Please try again.";
    
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    let sources: Array<{ title?: string; uri: string }> = [];
    
    if (groundingChunks) {
      groundingChunks.forEach((chunk: any) => {
        if (chunk.web?.uri) {
          sources.push({
            title: chunk.web.title || "Source",
            uri: chunk.web.uri
          });
        }
      });
    }

    // Deduplicate sources
    sources = sources.filter((v, i, a) => a.findIndex(t => (t.uri === v.uri)) === i);

    return { text, sources };

  } catch (error) {
    console.error("Gemini API Error:", error);
    return { text: "I encountered an error while researching. Please check your connection or API key." };
  }
};
