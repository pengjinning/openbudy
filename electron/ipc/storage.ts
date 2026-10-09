import { ipcMain } from 'electron'
import * as fs from 'fs/promises'
import * as path from 'path'
import * as os from 'os'

const CONFIG_DIR = path.join(os.homedir(), '.openbudy')
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json')

async function ensureConfigDir() {
  try {
    await fs.mkdir(CONFIG_DIR, { recursive: true })
  } catch { /* ignore */ }
}

async function readConfig(): Promise<Record<string, unknown>> {
  try {
    const content = await fs.readFile(CONFIG_FILE, 'utf-8')
    return JSON.parse(content)
  } catch {
    return {}
  }
}

async function writeConfig(config: Record<string, unknown>): Promise<void> {
  await ensureConfigDir()
  await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8')
}

export function registerStorageIpc(): void {
  ipcMain.handle('storage:get', async (_event, key: string) => {
    const config = await readConfig()
    return config[key] ?? null
  })

  ipcMain.handle('storage:set', async (_event, key: string, value: unknown) => {
    const config = await readConfig()
    config[key] = value
    await writeConfig(config)
  })

  ipcMain.handle('storage:delete', async (_event, key: string) => {
    const config = await readConfig()
    delete config[key]
    await writeConfig(config)
  })
}
