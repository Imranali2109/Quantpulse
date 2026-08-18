const fs = require('fs');
let code = fs.readFileSync('server/street-sheet.ts', 'utf8');
code = code.replace(/\.optional\(\)\.default\(\[\]\)/g, '');
fs.writeFileSync('server/street-sheet.ts', code);
