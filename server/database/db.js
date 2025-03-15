import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

// Convert module URL to file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the database file path correctly
const dbPath = path.join(__dirname, 'db.sqlite3');

const connectDB = async () => {
  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });
  // Enable foreign key enforcement
  await db.run('PRAGMA foreign_keys = ON;');
  return db;
};

export default connectDB;