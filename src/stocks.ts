import { readJsonFile, writeJsonFile } from './utils.js'

const stocksFilePath = './data/stocks.json';

export interface Stock {
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

export async function getAllStocks(): Promise<Stock[] | null> {
    const stocks = await readJsonFile(stocksFilePath) as Stock[];

    if (!stocks) {
        return null;
    } else {
        return stocks;
    }
}