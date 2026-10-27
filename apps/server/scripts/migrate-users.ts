/**
 * Copy users and their login accounts (password hashes included) from the old
 * Encore database into the new one. Safe to run more than once: existing rows
 * are skipped.
 *
 * Organizations and memberships are NOT copied. Recreate the barn(s) in the
 * new app and invite people, or add them with the new members API.
 *
 * Usage (from apps/server):
 *   OLD_DATABASE_URL=... DATABASE_URL=... pnpm migrate:users
 *   pnpm migrate:users -- --dry-run
 */
import { Client } from "pg";

const oldUrl = process.env.OLD_DATABASE_URL;
const newUrl = process.env.DATABASE_URL;
const dryRun = process.argv.includes("--dry-run");

if (!(oldUrl && newUrl)) {
  throw new Error("Set both OLD_DATABASE_URL and DATABASE_URL");
}

const USER_COLUMNS = [
  "id",
  "name",
  "email",
  "email_verified",
  "image",
  "image_key",
  "phone",
  "date_of_birth",
  "role",
  "banned",
  "ban_reason",
  "ban_expires",
  "created_at",
  "updated_at",
] as const;

const ACCOUNT_COLUMNS = [
  "id",
  "user_id",
  "account_id",
  "provider_id",
  "access_token",
  "refresh_token",
  "id_token",
  "access_token_expires_at",
  "refresh_token_expires_at",
  "scope",
  "password",
  "created_at",
  "updated_at",
] as const;

type Row = Record<string, unknown>;

async function copyRows(
  target: Client,
  table: string,
  columns: readonly string[],
  rows: Row[]
): Promise<number> {
  const placeholders = columns.map((_, index) => `$${index + 1}`).join(", ");
  const sql = `insert into ${table} (${columns.join(", ")}) values (${placeholders}) on conflict (id) do nothing`;
  let inserted = 0;
  for (const row of rows) {
    const result = await target.query(
      sql,
      columns.map((column) => row[column] ?? null)
    );
    inserted += result.rowCount ?? 0;
  }
  return inserted;
}

/** Only the wanted columns the old table actually has (older schemas lack some). */
async function existingColumns(
  source: Client,
  table: string,
  wanted: readonly string[]
): Promise<string[]> {
  const result = await source.query<{ column_name: string }>(
    "select column_name from information_schema.columns where table_name = $1",
    [table]
  );
  const present = new Set(result.rows.map((row) => row.column_name));
  return wanted.filter((column) => present.has(column));
}

async function main(): Promise<void> {
  const source = new Client({ connectionString: oldUrl });
  const target = new Client({ connectionString: newUrl });
  await source.connect();
  await target.connect();

  try {
    const userColumns = await existingColumns(
      source,
      "auth_users",
      USER_COLUMNS
    );
    const accountColumns = await existingColumns(
      source,
      "auth_accounts",
      ACCOUNT_COLUMNS
    );

    const users = await source.query<Row>(
      `select ${userColumns.join(", ")} from auth_users order by created_at`
    );
    const accounts = await source.query<Row>(
      `select ${accountColumns.join(", ")} from auth_accounts where user_id is not null`
    );

    console.info(
      `Found ${users.rowCount} users, ${accounts.rowCount} accounts`
    );
    for (const user of users.rows) {
      console.info(`  ${user.email}`);
    }

    if (dryRun) {
      console.info("Dry run, nothing written.");
      return;
    }

    await target.query("begin");
    const usersInserted = await copyRows(
      target,
      "users",
      userColumns,
      users.rows
    );
    const accountsInserted = await copyRows(
      target,
      "accounts",
      accountColumns,
      accounts.rows
    );
    await target.query("commit");

    console.info(
      `Inserted ${usersInserted} users, ${accountsInserted} accounts`
    );
  } catch (error) {
    await target.query("rollback").catch(() => undefined);
    throw error;
  } finally {
    await source.end();
    await target.end();
  }
}

await main();
