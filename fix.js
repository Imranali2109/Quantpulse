const fs = require('fs');
let code = fs.readFileSync('server/street-sheet.ts', 'utf8');
code = code.replace('firms: parsed.firms.map(f => ({ firm: f.firm, rating: f.rating, targetPrice: f.targetPrice, asOfDate: f.asOfDate })).optional().default([]),', 'firms: parsed.firms.map(f => ({ firm: f.firm, rating: f.rating, targetPrice: f.targetPrice, asOfDate: f.asOfDate })),');
fs.writeFileSync('server/street-sheet.ts', code);
