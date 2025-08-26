import 'dotenv/config';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('DATABASE_URL is not set. Aborting.');
    process.exit(1);
  }

  const sql = neon(databaseUrl);
  const db = drizzle({ client: sql });

  // Perform idempotent corridor renames
  const renames: Array<{ from: string; to: string }> = [
    { from: 'North', to: 'Beira' },
    { from: 'South', to: 'Nacala' },
    { from: 'East', to: 'Central (Dar es Salaam)' },
    { from: 'West', to: 'Durban' },
  ];

  for (const { from, to } of renames) {
    // Update only rows where corridor currently equals the old name
    const query = `update vehicles set corridor = $1 where corridor = $2`;
    // @ts-ignore: neon parameterized query
    const res = await sql(query, [to, from]);
    // eslint-disable-next-line no-console
    console.log(`Renamed corridor ${from} -> ${to} (updated ${Array.isArray(res) ? res.length : 'some'} rows)`);
  }

  // Exit cleanly
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});