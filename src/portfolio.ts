import { readJsonFile, writeJsonFile } from './utils.js'
import { PortfolioStock, User } from './users.js';
import { Stock, getStockByTicker } from './stocks.js';

const usersFilePath = './data/users.json';
const stocksFilePath = './data/stocks.json';

export async function handleBuy(user: User, ticker: string, amount: number): Promise<User | null> {
    const stock = await getStockByTicker(ticker) as Stock;

    if (!stock) {
        return null;
    }

    const purchaseCost = parseFloat((stock.price*amount).toFixed(2)) as number;

    if (user.balance < purchaseCost) {
        return null;
    }

    user.balance = parseFloat((user.balance - purchaseCost).toFixed(2));
    const portfolio = user.portfolio as PortfolioStock[];
    const existingStock = portfolio.find(s => s.stockTicker === ticker);

    if (existingStock) {
        const totalShares = existingStock.amount + amount;
        const totalCost = (existingStock.amount * existingStock.averagePrice) + purchaseCost;
        existingStock.amount = totalShares;
        existingStock.averagePrice = parseFloat((totalCost / totalShares).toFixed(2));
    } else {
        portfolio.push({
            stockName: stock.name,
            stockTicker: ticker,
            amount: amount,
            averagePrice: stock.price
        });
    }

    const users = await readJsonFile(usersFilePath) as User[];
    const updatedUsers = users.map((u) => {
        if (u.id === user.id) {
            return user;
        } else {
            return u;
        }
    });

    await writeJsonFile(usersFilePath, JSON.stringify(updatedUsers, null, 2));
    return user;
}

export async function handleSell(user: User, ticker: string, amount: number): Promise<User | null> {
    const stock = await getStockByTicker(ticker) as Stock;

    if (!stock) {
        return null;
    }

    const portfolio = user.portfolio as PortfolioStock[];
    const existingStock = portfolio.find(s => s.stockTicker === ticker);

    if (!existingStock) {
        return null;
    }

    if (existingStock.amount < amount) {
        return null;
    }

    const saleValue = parseFloat((stock.price*amount).toFixed(2));
    user.balance = parseFloat((user.balance + saleValue).toFixed(2));
    existingStock.amount -= amount;

    // If user now has 0 shares
    if (existingStock.amount === 0) {
        const index = portfolio.findIndex(s => s.stockTicker === ticker);
        if (index !== -1) {
            portfolio.splice(index, 1);
        }
    }

    const users = await readJsonFile(usersFilePath) as User[];
    const updatedUsers = users.map((u) => {
        if (u.id === user.id) {
            return user;
        } else {
            return u;
        }
    });

    await writeJsonFile(usersFilePath, JSON.stringify(updatedUsers, null, 2));
    return user;
}