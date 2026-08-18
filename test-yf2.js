import YahooFinance from "yahoo-finance2";
const yf = new YahooFinance();
async function run() {
  try {
    const quote = await yf.quote('RELIANCE.NS');
    console.log(quote.currency);
  } catch (e) {
    console.error(e);
  }
}
run();
