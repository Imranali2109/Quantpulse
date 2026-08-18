with open('server/db.ts', 'r') as f:
    db_code = f.read()

db_code = db_code.replace("import Database from 'better-sqlite3';", "import { DatabaseSync } from 'node:sqlite';")
db_code = db_code.replace("const db = new Database('quantpulse.db');", "const db = new DatabaseSync('quantpulse.db');")
db_code = db_code.replace("db.pragma('journal_mode = WAL');", "db.exec('PRAGMA journal_mode = WAL;');")

with open('server/db.ts', 'w') as f:
    f.write(db_code)
