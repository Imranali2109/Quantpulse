import YahooFinance from "yahoo-finance2";
const yf = new YahooFinance();
async function run() {
  try {
    const searchResult = await yf.search('AAPL');
    const pubTime = searchResult.news[0].providerPublishTime;
    console.log("pubTime:", pubTime);
    console.log("typeof:", typeof pubTime);
    console.log("constructor name:", pubTime?.constructor?.name);
    console.log("is it Date?", pubTime instanceof Date);
    
    // the code I wrote:
    console.log("formatted:", pubTime instanceof Date ? pubTime.toISOString() : (pubTime ? new Date(pubTime * 1000).toISOString() : new Date().toISOString()));
  } catch (e) {
    console.error(e);
  }
}
run();
