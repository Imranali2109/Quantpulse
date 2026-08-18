with open('server/street-sheet.ts', 'r') as f:
    street = f.read()

street = street.replace('if (!process.env.TAVILY_API_KEY || process.env.TAVILY_API_KEY === "dummy") {', 'if (!process.env.TAVILY_API_KEY || process.env.TAVILY_API_KEY === "dummy" || !process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "dummy") {')

with open('server/street-sheet.ts', 'w') as f:
    f.write(street)
