import sys

with open('server/street-sheet.ts', 'r') as f:
    lines = f.readlines()

for i in range(len(lines)):
    if 'parsed.firms' in lines[i]:
        lines[i] = "      firms: (parsed.firms || []).map((f: any) => ({ firm: f.firm, rating: f.rating, targetPrice: f.targetPrice, asOfDate: f.asOfDate })),\n"

with open('server/street-sheet.ts', 'w') as f:
    f.writelines(lines)
