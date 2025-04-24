import { promises as fs } from 'fs'

export async function readJsonFile<T>(filePath: string): Promise<T> {
    const jsonData = await fs.readFile(filePath, 'utf-8')
    return JSON.parse(jsonData) as T
}

export async function writeJsonFile(filePath: string, data: string) {
    await fs.writeFile(filePath, data)
}