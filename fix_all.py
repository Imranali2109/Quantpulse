import re

# 1. Rate Limiter
with open('server.ts', 'r') as f:
    server_code = f.read()

rl_code = """
const rateLimits = new Map<string, { count: number, resetAt: number }>();
app.use('/api', (req, res, next) => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const key = `${ip}:${req.path}`;
  const now = Date.now();
  const windowMs = 10000; // 10 seconds
  const maxRequests = 10; // max 10 requests per 10 seconds per endpoint
  const record = rateLimits.get(key);
  
  if (!record || now > record.resetAt) {
    rateLimits.set(key, { count: 1, resetAt: now + windowMs });
  } else {
    record.count++;
    if (record.count > maxRequests) {
      return res.status(429).json({ error: 'Too many requests' });
    }
  }
  next();
});
"""
if "const rateLimits = new Map" not in server_code:
    server_code = server_code.replace("app.use(express.json());", "app.use(express.json());\n" + rl_code)
    with open('server.ts', 'w') as f:
        f.write(server_code)

# 2. Street Sheet schema
with open('server/street-sheet.ts', 'r') as f:
    street_code = f.read()

new_schema = """const StreetSheetSchema = z.object({
  firms: z.any().transform(v => {
    if (!Array.isArray(v)) return [];
    return v.filter(f => f && typeof f === 'object').map(f => ({
      firm: typeof f.firm === 'string' ? f.firm : "Unknown",
      rating: typeof f.rating === 'string' ? f.rating : "N/A",
      targetPrice: typeof f.targetPrice === 'number' ? f.targetPrice : (Number(f.targetPrice) || 0),
      asOfDate: typeof f.asOfDate === 'string' ? f.asOfDate : "",
    }));
  }),"""
street_code = re.sub(r'const StreetSheetSchema = z\.object\(\{\n  firms: z\.any\(\)\.transform\(v => \{\n    if \(\!Array\.isArray\(v\)\) return \[\];\n    return v\.map\(f => \(\{\n      firm: typeof f\.firm === \'string\' \? f\.firm : "Unknown",\n      rating: typeof f\.rating === \'string\' \? f\.rating : "N/A",\n      targetPrice: typeof f\.targetPrice === \'number\' \? f\.targetPrice : \(Number\(f\.targetPrice\) \|\| 0\),\n      asOfDate: typeof f\.asOfDate === \'string\' \? f\.asOfDate : "",\n    \}\)\);\n  \}\),', new_schema, street_code)
with open('server/street-sheet.ts', 'w') as f:
    f.write(street_code)

# 3. QuoteLiteData in types.ts
with open('src/types.ts', 'r') as f:
    types_code = f.read()

if "export interface QuoteLiteData" not in types_code:
    types_code = types_code.replace("export interface QuoteData {", """export interface QuoteLiteData {
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
}

export interface QuoteData {""")
    with open('src/types.ts', 'w') as f:
        f.write(types_code)

# 4. Update src/App.tsx and LiveIdentityStrip.tsx
with open('src/App.tsx', 'r') as f:
    app_code = f.read()

app_code = app_code.replace("import { QuoteData,", "import { QuoteData, QuoteLiteData,")
app_code = app_code.replace("useData<QuoteData>(`/api/quote-lite/${symbol}`)", "useData<QuoteLiteData>(`/api/quote-lite/${symbol}`)")

abort_logic = """  const fetchFn = useCallback(async (isSilentRefresh = false) => {
    if (!url) return;
    
    const controller = new AbortController();
    
    if (!isSilentRefresh) setLoading(true);
    else setIsRefreshing(true);
    
    setError(null);
    
    try {
      const res = await fetch(url, { signal: controller.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const d = await res.json();
      if (d.error) throw new Error(d.error);
      
      setData(d);
      setLastUpdatedAt(Date.now());
    } catch (e: any) {
      if (e.name !== 'AbortError') setError(e.message);
    } finally {
      if (!isSilentRefresh) setLoading(false);
      setIsRefreshing(false);
    }
    
    return () => controller.abort();
  }, [url]);"""

app_code = re.sub(r'  const fetchFn = useCallback\(async \(isSilentRefresh = false\) => \{[\s\S]*?\}, \[url\]\);', abort_logic, app_code)

with open('src/App.tsx', 'w') as f:
    f.write(app_code)

with open('src/components/LiveIdentityStrip.tsx', 'r') as f:
    live_strip = f.read()

live_strip = live_strip.replace("import { QuoteData }", "import { QuoteLiteData }")
live_strip = live_strip.replace("quote: QuoteData | null;", "quote: QuoteLiteData | null;")
with open('src/components/LiveIdentityStrip.tsx', 'w') as f:
    f.write(live_strip)

