import { readJsonFile, writeJsonFile } from './utils.js'

const usersFilePath = './data-store/users.json';

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
    const users = await readJsonFile(usersFilePath) as User[];
    const user = users.find(user => user.id === id);

    if (!user) {
        return null;
    } else {
        return user;
    }
}

export async function getUserByCredentials(username: string, passwordHash: string): Promise<User | null> {
    const users = await readJsonFile(usersFilePath) as User[];
    const user = users.find(user => user.username === username && user.passwordHash === passwordHash);

    if (!user) {
        return null;
    } else {
        return user;
    }
}

export async function doesUserExist(username: string): Promise<boolean> {
    const users = await readJsonFile(usersFilePath) as User[];
    const user = users.find(user => user.username === username);

    if (user) {
        return true;
    } else {
        return false;
    }
}

export async function createUser(firstName: string, lastName: string, username: string, passwordHash: string): Promise<User> {
    const users = await readJsonFile<User[]>(usersFilePath);
    const id = findLowestAvailableId(users) as number;

    const newUser = {
        id: id,
        firstName: firstName,
        lastName: lastName,
        username: username,
        passwordHash: passwordHash,
        balance: 10000,
        portfolio: []
    } as User;

    users.push(newUser);
    await writeJsonFile(usersFilePath, JSON.stringify(users, null, 2));

    return newUser;
}

function findLowestAvailableId(users: User[]): number {
    const sortedIds = users.map(u => u.id).sort((a, b) => a - b);
    let expectedId = 1;

    for (const id of sortedIds) {
        if (id > expectedId) break;
        if (id === expectedId) expectedId++;
    }
    return expectedId;
}

export async function deleteUserById(id: number): Promise<void> {
    const users = await readJsonFile(usersFilePath) as User[];
    const updatedUsers = users.filter(user => user.id !== id) as User[];

    await writeJsonFile(usersFilePath, JSON.stringify(updatedUsers, null, 2));
}