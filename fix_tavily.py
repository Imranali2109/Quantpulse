import re

with open('server/street-sheet.ts', 'r') as f:
    code = f.read()

old_block = """    const searchPromise = tavilyClient.search(query, { includeDomains: [domain], maxResults: 3 });
    const timeoutPromise = new Promise<any>((_, reject) => setTimeout(() => reject(new Error("Tavily timeout")), 4000));
    const searchResult = await Promise.race([searchPromise, timeoutPromise]);
    if (!searchResult || !searchResult.results || searchResult.results.length === 0) {
       throw new Error("No search results");
    }
    
    const bestUrl = pickBestUrl(searchResult.results, ticker);

    const extractPromise = tavilyClient.extract([bestUrl]);
    const extractTimeout = new Promise<any>((_, reject) => setTimeout(() => reject(new Error("Extract timeout")), 5000));
    const extracted = await Promise.race([extractPromise, extractTimeout]);
    const rawText = extracted.results[0]?.rawContent;
    if (!rawText) throw new Error("extract_empty");"""

new_block = """    const searchPromise = tavilyClient.search(query, { includeDomains: [domain], maxResults: 3, includeRawContent: true });
    const timeoutPromise = new Promise<any>((_, reject) => setTimeout(() => reject(new Error("Tavily timeout")), 4000));
    const searchResult = await Promise.race([searchPromise, timeoutPromise]);
    if (!searchResult || !searchResult.results || searchResult.results.length === 0) {
       throw new Error("No search results");
    }
    
    const bestUrl = pickBestUrl(searchResult.results, ticker);
    const bestResult = searchResult.results.find((r: any) => r.url === bestUrl) || searchResult.results[0];
    const rawText = bestResult?.rawContent;
    if (!rawText) throw new Error("extract_empty");"""

code = code.replace(old_block, new_block)

with open('server/street-sheet.ts', 'w') as f:
    f.write(code)

