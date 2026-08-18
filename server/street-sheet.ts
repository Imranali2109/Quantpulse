import { z } from "zod";
import { tavily } from "@tavily/core";
import { GoogleGenAI } from "@google/genai";
import db, { getStreetSheetCache, saveStreetSheetCache } from "./db";

const StreetSheetSchema = z.object({
  firms: z.any().nullish().transform(v => {
    if (!Array.isArray(v)) return [];
    return v.filter(f => f && typeof f === 'object').map(f => ({
      firm: typeof f.firm === 'string' ? f.firm : "Unknown",
      rating: typeof f.rating === 'string' ? f.rating : "N/A",
      targetPrice: typeof f.targetPrice === 'number' ? f.targetPrice : (Number(f.targetPrice) || 0),
      asOfDate: typeof f.asOfDate === 'string' ? f.asOfDate : "",
    }));
  }),
  consensusRating: z.any().nullish().transform(v => typeof v === 'string' ? v : "N/A"),
  consensusTarget: z.any().nullish().transform(v => typeof v === 'number' ? v : (Number(v) || 0)),
  currentPrice: z.any().nullish().transform(v => typeof v === 'number' ? v : (Number(v) || 0)),
}).catchall(z.any());


const CACHE_TTL_HOURS = 24;

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "dummy" });
const tavilyClient = tavily({ apiKey: process.env.TAVILY_API_KEY || "dummy" });

function hoursSince(dateString: string): number {
  const diff = Date.now() - new Date(dateString).getTime();
  return diff / (1000 * 60 * 60);
}

function emptyStreetSheet(ticker: string, status: "ok" | "stale_cache" | "unavailable"): any {
  return {
    ticker,
    source: "benzinga",
    sourceUrl: "",
    fetchedAt: new Date().toISOString(),
    consensusRating: "N/A",
    consensusTarget: 0,
    currentPrice: 0,
    impliedUpsidePct: 0,
    firms: [],
    status
  };
}

function pickBestUrl(results: any[], ticker: string): string {
  const slug = ticker.toLowerCase();
  const match = results.find(r => r.url.toLowerCase().includes(slug));
  return match ? match.url : (results[0]?.url || "");
}

function stripFences(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith("\`\`\`json")) {
    cleaned = cleaned.substring(7);
  } else if (cleaned.startsWith("\`\`\`")) {
    cleaned = cleaned.substring(3);
  }
  if (cleaned.endsWith("\`\`\`")) {
    cleaned = cleaned.substring(0, cleaned.length - 3);
  }
  return cleaned.trim();
}

async function extractStructuredData(rawText: string) {
  const prompt = `Extract analyst target price data from this page content. Return ONLY valid JSON.
No prose, no markdown fences. If a field is not present in the text, omit that firm entirely rather than guessing.

PAGE CONTENT:
${rawText.slice(0, 8000)}`;
  
  const response = await ai.models.generateContent({
    model: "gemini-3.6-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: {
          firms: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                firm: { type: "STRING" },
                rating: { type: "STRING" },
                targetPrice: { type: "NUMBER" },
                asOfDate: { type: "STRING" },
              }
            }
          },
          consensusRating: { type: "STRING" },
          consensusTarget: { type: "NUMBER" },
          currentPrice: { type: "NUMBER" }
        }
      }
    }
  });
  const text = response.text || "{}";
  return JSON.parse(stripFences(text));
}

export async function getStreetSheet(ticker: string, market: "IN" | "US"): Promise<any> {
  const cached = getStreetSheetCache(ticker);
  if (cached && hoursSince(cached.fetchedAt) < CACHE_TTL_HOURS) {
    return { ...cached, status: "ok" };
  }

  if (!process.env.TAVILY_API_KEY || process.env.TAVILY_API_KEY === "dummy" || !process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "dummy") {
    if (cached) return { ...cached, status: "stale_cache" };
    return emptyStreetSheet(ticker, "unavailable");
  }

  try {
    const domain = market === "IN" ? "trendlyne.com" : "benzinga.com";
    const query = market === "IN"
      ? `${ticker} broker target price analyst rating`
      : `${ticker} analyst ratings price target`;

    const searchPromise = tavilyClient.search(query, { includeDomains: [domain], maxResults: 3, includeRawContent: true });
    const timeoutPromise = new Promise<any>((_, reject) => setTimeout(() => reject(new Error("Tavily timeout")), 4000));
    const searchResult = await Promise.race([searchPromise, timeoutPromise]);
    if (!searchResult || !searchResult.results || searchResult.results.length === 0) {
       throw new Error("No search results");
    }
    
    const bestUrl = pickBestUrl(searchResult.results, ticker);
    const bestResult = searchResult.results.find((r: any) => r.url === bestUrl) || searchResult.results[0];
    const rawText = bestResult?.rawContent;
    if (!rawText) throw new Error("extract_empty");

    const structured = await extractStructuredData(rawText);
    const parsed = StreetSheetSchema.parse(typeof structured === 'object' && structured !== null ? structured : {});

    const result = {
      ticker, 
      source: market === "IN" ? "trendlyne" : "benzinga",
      sourceUrl: bestUrl, 
      fetchedAt: new Date().toISOString(),
      consensusRating: parsed.consensusRating, 
      consensusTarget: parsed.consensusTarget,
      currentPrice: parsed.currentPrice,
      impliedUpsidePct: parsed.currentPrice > 0 ? ((parsed.consensusTarget - parsed.currentPrice) / parsed.currentPrice) * 100 : 0,
      firms: (parsed.firms || []).map((f: any) => ({ firm: f.firm, rating: f.rating, targetPrice: f.targetPrice, asOfDate: f.asOfDate })),
      status: "ok",
    };
    saveStreetSheetCache(result);
    return result;
  } catch (err) {
    console.warn(`street-sheet fetch failed for ${ticker}`, err);
    if (cached) return { ...cached, status: "stale_cache" };
    return emptyStreetSheet(ticker, "unavailable");
  }
}
