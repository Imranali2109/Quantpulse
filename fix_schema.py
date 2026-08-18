with open('server/street-sheet.ts', 'r') as f:
    code = f.read()

new_schema = """const StreetSheetSchema = z.object({
  firms: z.any().transform(v => {
    if (!Array.isArray(v)) return [];
    return v.map(f => ({
      firm: typeof f.firm === 'string' ? f.firm : "Unknown",
      rating: typeof f.rating === 'string' ? f.rating : "N/A",
      targetPrice: typeof f.targetPrice === 'number' ? f.targetPrice : (Number(f.targetPrice) || 0),
      asOfDate: typeof f.asOfDate === 'string' ? f.asOfDate : "",
    }));
  }),
  consensusRating: z.any().transform(v => typeof v === 'string' ? v : "N/A"),
  consensusTarget: z.any().transform(v => typeof v === 'number' ? v : (Number(v) || 0)),
  currentPrice: z.any().transform(v => typeof v === 'number' ? v : (Number(v) || 0)),
}).catchall(z.any());"""

import re
code = re.sub(r'const StreetSheetSchema = z\.object\(\{(?:[^{}]|\{(?:[^{}]|\{[^{}]*\})*\})*\}\);', new_schema, code)

with open('server/street-sheet.ts', 'w') as f:
    f.write(code)
