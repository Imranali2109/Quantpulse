const fs = require('fs');
let code = fs.readFileSync('server/street-sheet.ts', 'utf8');
console.log(code.indexOf('.optional().default([])'));
