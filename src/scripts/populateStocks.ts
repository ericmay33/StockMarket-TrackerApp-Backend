import axios from 'axios';
import Timeout from 'await-timeout';
import { writeJsonFile } from '../utils';

const tickers = [
    "AAPL", // Apple
    "MSFT", // Microsoft
    "NVDA", // Nvidia
    "GOOGL", // Alphabet (Class A)
    "AMZN", // Amazon
    "META", // Meta Platforms
    "BRK-B", // Berkshire Hathaway (Class B)
    "LLY", // Eli Lilly
    "TSLA", // Tesla
    "AVGO", // Broadcom
    "WMT", // Walmart
    "JPM", // JPMorgan Chase
    "V", // Visa
    "MA", // Mastercard
    "UNH", // UnitedHealth Group
    "XOM", // Exxon Mobil
    "COST", // Costco Wholesale
    "ORCL", // Oracle
    "NFLX", // Netflix
    "HD", // Home Depot
    "ABBV", // AbbVie
    "TMUS", // T-Mobile US
    "PM", // Philip Morris International
    "CRM", // Salesforce
    "IBM", // IBM
    "CSCO", // Cisco Systems
    "WFC", // Wells Fargo
    "MRK", // Merck
    "PEP", // PepsiCo
    "TMO", // Thermo Fisher Scientific
    "GS", // Goldman Sachs
    "BKNG", // Booking Holdings
    "SPGI", // S&P Global
    "TJX", // TJX Companies
    "CAT", // Caterpillar
    "BLK", // BlackRock
    "NEE", // NextEra Energy
    "PFE", // Pfizer
    "INTC", // Intel
    "KO", // Coca-Cola
    "BA", // Boeing
    "DIS", // Disney
    "AMD", // AMD
    "CVX", // Chevron
    "LOW", // Lowe’s
    "MCD", // McDonald’s
    "QCOM", // Qualcomm
    "AMGN", // Amgen
    "INTU", // Intuit
    "T", // AT&T
    "C", // Citigroup
    "BAC", // Bank of America
    "CMCSA", // Comcast
    "UPS", // United Parcel Service
    "ADBE", // Adobe
    "NKE", // Nike
    "RTX", // RTX Corporation
    "HON", // Honeywell
    "DE", // Deere & Company
    "LMT", // Lockheed Martin
    "SCHW", // Charles Schwab
    "ABT", // Abbott Laboratories
    "DHR", // Danaher
    "COP", // ConocoPhillips
    "MDT", // Medtronic
    "AXP", // American Express
    "NOW", // ServiceNow
    "TXN", // Texas Instruments
    "AMT", // American Tower
    "CI", // Cigna
    "MS", // Morgan Stanley
    "SBUX", // Starbucks
    "PLD", // Prologis
    "GILD", // Gilead Sciences
    "BMY", // Bristol-Myers Squibb
    "MMM", // 3M
    "CL", // Colgate-Palmolive
    "MO", // Altria Group
    "PNC", // PNC Financial Services
    "USB", // U.S. Bancorp
    "SO", // Southern Company
    "DUK", // Duke Energy
    "TGT", // Target
    "EOG", // EOG Resources
    "ZTS", // Zoetis
    "FDX", // FedEx
    "ITW", // Illinois Tool Works
    "CSX", // CSX Corporation
    "BIIB", // Biogen
    "AON", // Aon
    "SYK", // Stryker
    "REGN", // Regeneron Pharmaceuticals
    "EL", // Estée Lauder
    "ADI", // Analog Devices
    "KMB", // Kimberly-Clark
    "GD", // General Dynamics
    "CME", // CME Group
    "ALL", // Allstate
    "AIG", // American International Group
    "TRV" // The Travelers Companies
] as string[];

// REMOVED KEY
const API_KEY = '';

interface Stock {
    ticker: string;
    name: string;
    marketCap: number;
    percentChange: number;
    price: number;
    sector: string;
    industry: string;
    description: string;
    image: string;
}

async function fetchStockData(ticker: string): Promise<Stock | null> {
    try {
        const url = `https://financialmodelingprep.com/stable/profile?symbol=${ticker}&apikey=${API_KEY}`;

        const response = await axios.get(url);
        const data = response.data[0];

        if (!data) {
            console.log(`No data for ${ticker}`);
            return null;
        }

        return {
            ticker: data.symbol,
            name: data.companyName,
            marketCap: data.marketCap,
            percentChange: data.changePercentage,
            price: data.price,
            sector: data.sector,
            industry: data.industry,
            description: data.description,
            image: data.image
        };
    } catch (err) {
        console.error(`Error fetching ${ticker}:`, (err as Error).message);
        return null;
    }
}

async function main() {
    const stocks = [] as Stock[];

    for (let i = 0; i < tickers.length; i++) {
        const stock = await fetchStockData(tickers[i] as string);
        if (stock) {
            stocks.push(stock);
        }

        await Timeout.set(500); // wait 1 second before next request
    }

    await writeJsonFile('./data/stocks.json', JSON.stringify(stocks, null, 2));
    console.log(`Saved ${stocks.length} stocks to ./data/stocks.json`);
}

main();