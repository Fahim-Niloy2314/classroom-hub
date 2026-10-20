// Keep the owner API's small prepared-statement interface on real Postgres.
// Parameters are always bound; this conversion runs only on our constant SQL.
export function postgresStatement(sql: string) {
  const ignore = /^INSERT OR IGNORE INTO /i.test(sql);
  let query = sql.replace(/^INSERT OR IGNORE INTO /i, 'INSERT INTO ');
  let index = 0;
  query = query.replace(/\?/g, () => '$' + ++index);
  if (ignore) query += ' ON CONFLICT DO NOTHING';
  // PostgreSQL requires an explicit target alias in UPSERT expressions.
  if (/^INSERT INTO hub_limits\(/.test(query)) {
    query = query.replace('INSERT INTO hub_limits(', 'INSERT INTO hub_limits AS existing(')
      .replace(/WHEN expires</g, 'WHEN existing.expires<')
      .replace('ELSE count+1', 'ELSE existing.count+1')
      .replace('ELSE expires END', 'ELSE existing.expires END');
  }
  return query;
}

function normalizedRow(row: any) {
  if (!row) return null;
  const result = {...row};
  for (const key of ['count', 'expires', 'seen', 'retry', 'attempts']) {
    if (result[key] !== undefined && result[key] !== null) result[key] = Number(result[key]);
  }
  return result;
}

export function postgresStorage(pool: any) {
  function prepare(sql: string) {
    const query = postgresStatement(sql);
    return {
      query,
      args: [] as unknown[],
      bind(...args: unknown[]) { this.args = args; return this; },
      async first() { return normalizedRow((await pool.query(query, this.args)).rows[0]); },
      async all() { return {results: (await pool.query(query, this.args)).rows.map(normalizedRow)}; },
      async run() { return {meta: {changes: (await pool.query(query, this.args)).rowCount || 0}}; }
    };
  }
  async function batch(statements: ReturnType<typeof prepare>[]) {
    const connection = await pool.connect();
    try {
      await connection.query('BEGIN');
      const results = [];
      for (const statement of statements) {
        const response = await connection.query(statement.query, statement.args);
        results.push({meta: {changes: response.rowCount || 0}});
      }
      await connection.query('COMMIT');
      return results;
    } catch (error) {
      await connection.query('ROLLBACK');
      throw error;
    } finally { connection.release(); }
  }
  return {prepare, batch};
}
