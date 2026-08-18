import os

with open('server.ts', 'r') as f:
    server_code = f.read()

rl_code = """
const rateLimits = new Map<string, { count: number, resetAt: number }>();

app.use('/api', (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const key = `${ip}:${req.path}`;
  const now = Date.now();
  const windowMs = 10000; // 10 seconds
  const maxRequests = 10; // max 10 requests per 10 seconds per endpoint
  
  if (!rateLimits.has(key)) {
    rateLimits.set(key, { count: 1, resetAt: now + windowMs });
  } else {
    const record = rateLimits.get(key)!;
    if (now > record.resetAt) {
      record.count = 1;
      record.resetAt = now + windowMs;
    } else {
      record.count++;
      if (record.count > maxRequests) {
        return res.status(429).json({ error: 'Too many requests' });
      }
    }
  }
  next();
});
"""

if "const rateLimits = new Map" not in server_code:
    server_code = server_code.replace("const PORT = process.env.PORT || 3000;", "const PORT = process.env.PORT || 3000;\n" + rl_code)

with open('server.ts', 'w') as f:
    f.write(server_code)

