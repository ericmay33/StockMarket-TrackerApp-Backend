import { readJsonFile, writeJsonFile } from './utils.js'

export interface PortfolioStock {
    stockName: string;
    stockTicker: string;
    amount: number;
    averagePrice: number;
}
  
export interface User {
    id: number;
    username: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    balance: number;
    portfolio: PortfolioStock[];
}

export async function getUserById(id: number): Promise<User | null> {
    const users = await readJsonFile('./data/users.json') as User[];
    const user = users.find(user => user.id === id);

    if (!user) {
        return null;
    } else {
        return user;
    }
}

export async function getUserByCredentials(username: string, passwordHash: string): Promise<User | null> {
    const users = await readJsonFile('./data/users.json') as User[];
    const user = users.find(user => user.username === username && user.passwordHash === passwordHash);

    if (!user) {
        return null;
    } else {
        return user;
    }
}