import { migrate } from "drizzle-orm/postgres-js/migrator"
import db from "./db"

const migrateDB = async () => {
  try {
    console.log("🔃 Migrating client")
    await migrate(db, { migrationsFolder: "migrations" })
    console.log("🟢 Successfully migrated")
  } catch (err) {
    console.log("❌ Error in migrating client")
  }
}

migrateDB()
