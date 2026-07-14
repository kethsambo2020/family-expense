-- Family Ledger — Cloudflare D1 schema
-- Run this once in the D1 database console (Dashboard → D1 → your database → Console)

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS entries (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  amount REAL NOT NULL,
  currency TEXT NOT NULL,
  category TEXT NOT NULL,
  date TEXT NOT NULL,
  member TEXT,
  note TEXT,
  created_by_name TEXT,
  created_by_user_id TEXT,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  icon TEXT,
  en TEXT,
  kh TEXT,
  color TEXT
);
