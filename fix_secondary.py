with open('src/App.tsx', 'r') as f:
    app_code = f.read()

secondary_panels = """
        {/* 6. Secondary Panels */}
        <div className="flex bg-paper border-t border-rule/30 p-6 gap-6 overflow-x-auto hide-scrollbar">
          {/* Accuracy */}
          <div className="min-w-[250px] shrink-0 border-r border-rule/30 pr-6">
            <div className="text-[10px] font-sans font-bold text-ink-45 uppercase tracking-[0.1em] mb-3">Model Accuracy</div>
            {accuracy && accuracy.status === 'ok' ? (
              <div>
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-3xl font-mono text-ink tracking-tight">{accuracy.hitRate}%</span>
                  <Badge variant={accuracy.hitRate! > 55 ? 'bull' : 'gray'}>
                    {accuracy.hitRate! > 55 ? 'Strong' : 'Weak'} Edge
                  </Badge>
                </div>
                <div className="text-[10px] font-mono text-ink-70 leading-relaxed border-t border-rule/30 pt-2">
                  Based on historical backtest over {accuracy.sampleSize} signals.
                </div>
              </div>
            ) : (
              <div>
                <span className="text-xl font-mono text-ink tracking-tight">Insufficient Data</span>
                <div className="text-[10px] font-mono text-ink-70 leading-relaxed border-t border-rule/30 pt-2 mt-2">
                  Found {accuracy?.sampleSize || 0} signals. Need 15+.
                </div>
              </div>
            )}
          </div>
          
          {/* Street Sheet */}
          <div className="min-w-[300px] shrink-0 border-r border-rule/30 pr-6">
            <StreetSheetPanel data={streetSheet} loading={convergenceLoading} error={null} />
          </div>

          {/* News */}
          <div className="min-w-[300px] shrink-0">
            <div className="text-[10px] font-sans font-bold text-ink-45 uppercase tracking-[0.1em] mb-3">Exhibits</div>
            {news && news.length > 0 ? (
              <div className="space-y-3">
                {news.slice(0, 3).map((item, i) => (
                  <a key={i} href={item.link} target="_blank" rel="noreferrer" className="block group">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[9px] font-sans font-bold text-ink-45 uppercase tracking-[0.1em]">{item.source}</span>
                      <span className="text-[9px] font-mono text-ink-45">{new Date(item.time).toLocaleDateString()}</span>
                    </div>
                    <h4 className="text-[11px] font-mono text-ink group-hover:underline underline-offset-2 decoration-ink-45 transition-all line-clamp-2 leading-snug">{item.headline}</h4>
                  </a>
                ))}
              </div>
            ) : (
              <div className="text-[11px] font-mono text-ink-45">No recent exhibits found.</div>
            )}
          </div>
        </div>

        {/* 5. Bottom band — Engine Trace */}
"""

app_code = app_code.replace("{/* 5. Bottom band — Engine Trace */}", secondary_panels)

with open('src/App.tsx', 'w') as f:
    f.write(app_code)

