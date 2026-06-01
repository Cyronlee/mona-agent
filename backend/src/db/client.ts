import path from "path"
import { fileURLToPath } from "url"
import { PrismaClient } from "../../prisma/generated/client.js"
import { PrismaBunSqlite } from "prisma-adapter-bun-sqlite"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DB_PATH = path.join(__dirname, "../../prisma/dev.db")

const adapter = new PrismaBunSqlite({
  url: `file:${DB_PATH}`,
  wal: true,
})

export const prisma = new PrismaClient({ adapter })

export type { ChatSession, ChatMessage, BackgroundJob } from "../../prisma/generated/client.js"
