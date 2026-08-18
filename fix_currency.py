with open('src/types.ts', 'r') as f:
    types = f.read()
types = types.replace("volume: number;\n}", "volume: number;\n  currency: string;\n}")
with open('src/types.ts', 'w') as f:
    f.write(types)

with open('server.ts', 'r') as f:
    server = f.read()
server = server.replace("volume: data.volume\n      });", "volume: data.volume,\n        currency: data.currency\n      });")
with open('server.ts', 'w') as f:
    f.write(server)
