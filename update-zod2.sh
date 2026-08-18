cat << 'SCHEMA_EOF' > schema.ts
const StreetSheetSchema = z.object({
  firms: z.array(z.object({
    firm: z.any().transform(v => typeof v === 'string' ? v : "Unknown"),
    rating: z.any().transform(v => typeof v === 'string' ? v : "N/A"),
    targetPrice: z.any().transform(v => typeof v === 'number' ? v : (Number(v) || 0)),
    asOfDate: z.any().transform(v => typeof v === 'string' ? v : ""),
  })).nullish().transform(v => Array.isArray(v) ? v : []),
  consensusRating: z.any().transform(v => typeof v === 'string' ? v : "N/A"),
  consensusTarget: z.any().transform(v => typeof v === 'number' ? v : (Number(v) || 0)),
  currentPrice: z.any().transform(v => typeof v === 'number' ? v : (Number(v) || 0)),
});
SCHEMA_EOF
perl -i -p0e 's/const StreetSheetSchema = z\.object\(\{\s*firms.*?\}\);/`cat schema.ts`/se' server/street-sheet.ts
