import re

with open('server/street-sheet.ts', 'r') as f:
    code = f.read()

code = code.replace("const parsed = StreetSheetSchema.parse(structured);", "const parsed = StreetSheetSchema.parse(typeof structured === 'object' && structured !== null ? structured : {});")

with open('server/street-sheet.ts', 'w') as f:
    f.write(code)
