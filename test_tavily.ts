import { tavily } from "@tavily/core";
const tavilyClient = tavily({ apiKey: process.env.TAVILY_API_KEY || "dummy" });

async function test() {
  const result = await tavilyClient.search("AAPL analyst ratings price target", { includeDomains: ["benzinga.com"], maxResults: 3, includeRawContent: true });
  console.log(result.results.map(r => ({ url: r.url, hasRaw: !!r.rawContent })));
}
test().catch(console.error);
