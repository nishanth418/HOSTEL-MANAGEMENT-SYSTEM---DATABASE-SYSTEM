const { query, REQUIRED_TABLES } = require('./db-mysql');

async function verifyMySQL() {
  console.log('=== VERIFYING AIVEN CLOUD MYSQL DATABASE ===\n');

  // 1. Table Counts
  console.log('1. TABLE ROW COUNTS:');
  let totalRows = 0;
  for (const table of REQUIRED_TABLES) {
    const [res] = await query(`SELECT COUNT(*) as cnt FROM \`${table}\``);
    console.log(` - ${table.padEnd(16)}: ${res.cnt} rows`);
    totalRows += res.cnt;
  }
  console.log(` Total records across all 18 tables: ${totalRows}\n`);

  // 2. Foreign Keys
  console.log('2. FOREIGN KEY CONSTRAINTS:');
  const fks = await query(`
    SELECT 
      TABLE_NAME as childTable,
      COLUMN_NAME as childCol,
      REFERENCED_TABLE_NAME as parentTable,
      REFERENCED_COLUMN_NAME as parentCol
    FROM information_schema.KEY_COLUMN_USAGE 
    WHERE TABLE_SCHEMA = DATABASE() 
      AND REFERENCED_TABLE_NAME IS NOT NULL
    ORDER BY TABLE_NAME, COLUMN_NAME
  `);
  console.log(` Found ${fks.length} foreign key relationships in MySQL:`);
  fks.forEach(f => {
    console.log(` - ${f.childTable}.${f.childCol} -> ${f.parentTable}.${f.parentCol}`);
  });

  // 3. Foreign Key Cascade Verification
  console.log('\n3. CASCADE RULES:');
  const cascades = await query(`
    SELECT 
      TABLE_NAME as childTable,
      CONSTRAINT_NAME as constraintName,
      DELETE_RULE as deleteRule
    FROM information_schema.REFERENTIAL_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = DATABASE()
    ORDER BY TABLE_NAME
  `);
  cascades.forEach(c => {
    console.log(` - ${c.childTable} [${c.constraintName}]: ON DELETE ${c.deleteRule}`);
  });

  process.exit(0);
}

verifyMySQL().catch(err => {
  console.error('Verification failed:', err.message);
  process.exit(1);
});
