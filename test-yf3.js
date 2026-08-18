import YahooFinance from "yahoo-finance2";
const yf = new YahooFinance();
async function run() {
  try {
    const q1 = await yf.chart('AAPL', { range: '1d', interval: '5m' });
    console.log("1D:", q1.quotes.length);
    const q5 = await yf.chart('AAPL', { range: '5d', interval: '15m' });
    console.log("5D:", q5.quotes.length);
  } catch (e) {
    console.error(e);
  }
}
run();
