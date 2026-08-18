export interface Security {
  ticker: string;
  name: string;
  exchange: string;
  country: string;
  sector: string;
  industry: string;
  assetType: 'Stock' | 'Crypto' | 'ETF' | 'Index';
  aliases?: string[];
}

export const securities: Security[] = [
  { ticker: 'AAPL', name: 'Apple Inc.', exchange: 'NASDAQ', country: 'USA', sector: 'Technology', industry: 'Consumer Electronics', assetType: 'Stock', aliases: ['apple', 'appl', 'apple incorporated'] },
  { ticker: 'GOOGL', name: 'Alphabet Inc.', exchange: 'NASDAQ', country: 'USA', sector: 'Communication Services', industry: 'Interactive Media & Services', assetType: 'Stock', aliases: ['google', 'alphabet', 'goog'] },
  { ticker: 'META', name: 'Meta Platforms, Inc.', exchange: 'NASDAQ', country: 'USA', sector: 'Communication Services', industry: 'Interactive Media & Services', assetType: 'Stock', aliases: ['facebook', 'fb', 'meta'] },
  { ticker: 'TSLA', name: 'Tesla, Inc.', exchange: 'NASDAQ', country: 'USA', sector: 'Consumer Cyclical', industry: 'Auto Manufacturers', assetType: 'Stock', aliases: ['tesla', 'tsla', 'tesal'] },
  { ticker: 'NVDA', name: 'NVIDIA Corporation', exchange: 'NASDAQ', country: 'USA', sector: 'Technology', industry: 'Semiconductors', assetType: 'Stock', aliases: ['nvidia', 'nvda', 'nvdia'] },
  { ticker: 'MSFT', name: 'Microsoft Corporation', exchange: 'NASDAQ', country: 'USA', sector: 'Technology', industry: 'Software - Infrastructure', assetType: 'Stock', aliases: ['microsoft', 'msft', 'microsof'] },
  { ticker: 'AMZN', name: 'Amazon.com, Inc.', exchange: 'NASDAQ', country: 'USA', sector: 'Consumer Cyclical', industry: 'Internet Retail', assetType: 'Stock', aliases: ['amazon', 'amzn', 'amzon'] },
  { ticker: 'NFLX', name: 'Netflix, Inc.', exchange: 'NASDAQ', country: 'USA', sector: 'Communication Services', industry: 'Entertainment', assetType: 'Stock', aliases: ['netflix', 'nflx'] },
  { ticker: 'RELIANCE.NS', name: 'Reliance Industries Limited', exchange: 'NSE', country: 'India', sector: 'Energy', industry: 'Oil & Gas Refining & Marketing', assetType: 'Stock', aliases: ['reliance', 'ril', 'reliace'] },
  { ticker: 'TCS.NS', name: 'Tata Consultancy Services', exchange: 'NSE', country: 'India', sector: 'Technology', industry: 'Information Technology Services', assetType: 'Stock', aliases: ['tcs', 'tata consultancy'] },
  { ticker: 'HDFCBANK.NS', name: 'HDFC Bank Limited', exchange: 'NSE', country: 'India', sector: 'Financial Services', industry: 'Banks - Regional', assetType: 'Stock', aliases: ['hdfc', 'hdfc bank'] },
  { ticker: 'INFY.NS', name: 'Infosys Limited', exchange: 'NSE', country: 'India', sector: 'Technology', industry: 'Information Technology Services', assetType: 'Stock', aliases: ['infosys', 'infy', 'infosis'] },
  { ticker: 'BTC-USD', name: 'Bitcoin', exchange: 'CRYPTO', country: 'Global', sector: 'Cryptocurrency', industry: 'Digital Currency', assetType: 'Crypto', aliases: ['btc', 'bitcoin'] },
  { ticker: 'ETH-USD', name: 'Ethereum', exchange: 'CRYPTO', country: 'Global', sector: 'Cryptocurrency', industry: 'Digital Currency', assetType: 'Crypto', aliases: ['eth', 'ethereum'] },
  { ticker: 'SPY', name: 'SPDR S&P 500 ETF Trust', exchange: 'NYSEARCA', country: 'USA', sector: 'ETF', industry: 'Large Cap Blend', assetType: 'ETF', aliases: ['spy', 's&p 500', 'sp500'] },
  { ticker: 'QQQ', name: 'Invesco QQQ Trust', exchange: 'NASDAQ', country: 'USA', sector: 'ETF', industry: 'Large Cap Growth', assetType: 'ETF', aliases: ['qqq', 'nasdaq 100'] },
  { ticker: 'AMD', name: 'Advanced Micro Devices, Inc.', exchange: 'NASDAQ', country: 'USA', sector: 'Technology', industry: 'Semiconductors', assetType: 'Stock', aliases: ['amd', 'advanced micro devices'] },
  { ticker: 'INTC', name: 'Intel Corporation', exchange: 'NASDAQ', country: 'USA', sector: 'Technology', industry: 'Semiconductors', assetType: 'Stock', aliases: ['intel', 'intc'] },
  { ticker: 'CRM', name: 'Salesforce, Inc.', exchange: 'NYSE', country: 'USA', sector: 'Technology', industry: 'Software - Application', assetType: 'Stock', aliases: ['salesforce', 'crm'] },
  { ticker: 'PYPL', name: 'PayPal Holdings, Inc.', exchange: 'NASDAQ', country: 'USA', sector: 'Financial Services', industry: 'Credit Services', assetType: 'Stock', aliases: ['paypal', 'pypl'] },
  { ticker: 'V', name: 'Visa Inc.', exchange: 'NYSE', country: 'USA', sector: 'Financial Services', industry: 'Credit Services', assetType: 'Stock', aliases: ['visa', 'v'] },
  { ticker: 'MA', name: 'Mastercard Incorporated', exchange: 'NYSE', country: 'USA', sector: 'Financial Services', industry: 'Credit Services', assetType: 'Stock', aliases: ['mastercard', 'ma'] },
  { ticker: 'JPM', name: 'JPMorgan Chase & Co.', exchange: 'NYSE', country: 'USA', sector: 'Financial Services', industry: 'Banks - Diversified', assetType: 'Stock', aliases: ['jpmorgan', 'jpm', 'chase'] },
  { ticker: 'WMT', name: 'Walmart Inc.', exchange: 'NYSE', country: 'USA', sector: 'Consumer Defensive', industry: 'Discount Stores', assetType: 'Stock', aliases: ['walmart', 'wmt'] },
  { ticker: 'DIS', name: 'The Walt Disney Company', exchange: 'NYSE', country: 'USA', sector: 'Communication Services', industry: 'Entertainment', assetType: 'Stock', aliases: ['disney', 'dis'] },
  { ticker: 'BRK-B', name: 'Berkshire Hathaway Inc.', exchange: 'NYSE', country: 'USA', sector: 'Financial Services', industry: 'Insurance - Diversified', assetType: 'Stock', aliases: ['berkshire', 'brk', 'warren buffett'] },
  { ticker: 'JNJ', name: 'Johnson & Johnson', exchange: 'NYSE', country: 'USA', sector: 'Healthcare', industry: 'Drug Manufacturers', assetType: 'Stock', aliases: ['jnj', 'johnson'] },
  { ticker: 'UNH', name: 'UnitedHealth Group Incorporated', exchange: 'NYSE', country: 'USA', sector: 'Healthcare', industry: 'Healthcare Plans', assetType: 'Stock', aliases: ['unitedhealth', 'unh'] },
  { ticker: 'PG', name: 'The Procter & Gamble Company', exchange: 'NYSE', country: 'USA', sector: 'Consumer Defensive', industry: 'Household & Personal Products', assetType: 'Stock', aliases: ['procter & gamble', 'pg'] },
  { ticker: 'HD', name: 'The Home Depot, Inc.', exchange: 'NYSE', country: 'USA', sector: 'Consumer Cyclical', industry: 'Home Improvement Retail', assetType: 'Stock', aliases: ['home depot', 'hd'] },
  { ticker: 'BAC', name: 'Bank of America Corporation', exchange: 'NYSE', country: 'USA', sector: 'Financial Services', industry: 'Banks - Diversified', assetType: 'Stock', aliases: ['bank of america', 'bac', 'bofa'] },
  { ticker: 'XOM', name: 'Exxon Mobil Corporation', exchange: 'NYSE', country: 'USA', sector: 'Energy', industry: 'Oil & Gas Integrated', assetType: 'Stock', aliases: ['exxon', 'xom'] },
];
