import YahooFinance from "yahoo-finance2";
const yf = new YahooFinance();
async function run() {
  try {
    const period1 = new Date();
    period1.setDate(period1.getDate() - 1);
    const q1 = await yf.chart('AAPL', { period1, interval: '5m' });
    console.log("1D:", q1.quotes.length);
    
    const p5 = new Date();
    p5.setDate(p5.getDate() - 5);
    const q5 = await yf.chart('AAPL', { period1: p5, interval: '15m' });
    console.log("5D:", q5.quotes.length);
  } catch (e) {
    console.error(e);
  }
}
run();
