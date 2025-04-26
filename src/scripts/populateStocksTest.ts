import axios from 'axios';
import { writeJsonFile } from '../utils';
import Timeout from 'await-timeout';

// REMOVED KEY
const API_KEY = '';
const TICKER = "TRV";

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

        if (!Array.isArray(response.data) || response.data.length === 0) {
            console.log(`No data for ${ticker}`);
            return null;
        }

        const data = response.data[0];

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

    const stock = await fetchStockData(TICKER);

    if (stock) {
        await writeJsonFile('./data/test-stock.json', JSON.stringify(stock, null, 2));
        console.log(`Saved stock data for ${TICKER} to ./data/test-stock.json`);
    } else {
        console.log(`Failed to fetch stock data for ${TICKER}`);
    }
}

main();