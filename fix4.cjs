const fs = require('fs');
let code = fs.readFileSync('server/street-sheet.ts', 'utf8');
code = code.split('.optional().default([])').join('');
fs.writeFileSync('server/street-sheet.ts', code);
