with open('src/App.tsx', 'r') as f:
    app_code = f.read()

app_code = app_code.replace("""              <PriceChart 
                data={chart || []} 
                ticker={symbol} 
                timeframe={timeframe} 
                onTimeframeChange={setTimeframe} 
              />""", """              <div className="flex justify-end px-4 py-2 border-b border-rule/30 space-x-1">
                {['1D', '1W', '1M', '3M', '6M', '1Y'].map(tf => (
                  <button 
                    key={tf} 
                    onClick={() => setTimeframe(tf)}
                    className={`px-3 py-1 text-[10px] font-mono transition-colors ${timeframe === tf ? 'bg-ink text-paper' : 'text-ink-70 hover:bg-rule/30'}`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
              <PriceChart 
                data={chart || []} 
              />""")

with open('src/App.tsx', 'w') as f:
    f.write(app_code)

with open('src/components/ConvictionPanel.tsx', 'r') as f:
    cp_code = f.read()

cp_code = cp_code.replace("./ui/Badge", "./ui/badge")

with open('src/components/ConvictionPanel.tsx', 'w') as f:
    f.write(cp_code)

