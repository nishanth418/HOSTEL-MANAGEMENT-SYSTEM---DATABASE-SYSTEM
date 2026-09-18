const { getPool } = require('./db-mysql');

async function testAivenConnection() {
  let pool = null;
  try {
    pool = getPool();

    // 1. Basic ping & database info
    const [infoRows] = await pool.query(`
      SELECT 1 AS ping, DATABASE() AS database_name, VERSION() AS server_version
    `);

    // 2. SSL status verification
    const [sslCipherRows] = await pool.query("SHOW STATUS LIKE 'Ssl_cipher'");
    const [sslVersionRows] = await pool.query("SHOW STATUS LIKE 'Ssl_version'");

    const cipher = sslCipherRows && sslCipherRows.length > 0 ? sslCipherRows[0].Value : 'Not Reported';
    const tlsVersion = sslVersionRows && sslVersionRows.length > 0 ? sslVersionRows[0].Value : 'Not Reported';
    const isSslActive = cipher && cipher !== '' && cipher !== 'None';

    console.log('--- AIVEN MYSQL CONNECTION TEST REPORT ---');
    console.log('1. Connection Result: SUCCESSFUL');
    console.log(`2. Database Server Status: Connected`);
    console.log(`   - Database Name: ${infoRows[0].database_name}`);
    console.log(`   - MySQL Version: ${infoRows[0].server_version}`);
    console.log(`3. SSL Connection Status: ${isSslActive ? 'ACTIVE (Encrypted)' : 'INACTIVE'}`);
    console.log(`   - TLS Protocol: ${tlsVersion}`);
    console.log(`   - Cipher: ${cipher}`);
    console.log('4. Errors: None');
    console.log('------------------------------------------');

    await pool.end();
    process.exit(0);
  } catch (err) {
    // Sanitize any potential credential strings from error messages
    const sanitizedMsg = (err.message || 'Unknown error').replace(/:([^:@]+)@/g, ':••••••••@');

    console.log('--- AIVEN MYSQL CONNECTION TEST REPORT ---');
    console.log('1. Connection Result: FAILED');
    console.log(`2. Database Server Status: Disconnected`);
    console.log(`3. SSL Connection Status: Unknown / Failed during handshake`);
    console.log(`4. Error Details:`);
    console.log(`   - Code: ${err.code || 'UNKNOWN'}`);
    console.log(`   - Message: ${sanitizedMsg}`);

    if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('   - Suggested Fix: Check the DB_USER or DB_PASSWORD in backend/.env.');
    } else if (err.code === 'ENOTFOUND' || err.code === 'EAI_AGAIN') {
      console.log('   - Suggested Fix: Check the hostname (DB_HOST) or internet connection.');
    } else if (err.code === 'ETIMEDOUT' || err.code === 'ECONNREFUSED') {
      console.log('   - Suggested Fix: Check the port (DB_PORT) or network firewall / allowed IP addresses in Aiven console.');
    } else if (err.code === 'HANDSHAKE_SSL_ERROR' || err.message.includes('SSL')) {
      console.log('   - Suggested Fix: Ensure SSL is required with DB_SSL=true.');
    }
    console.log('------------------------------------------');

    if (pool) {
      try { await pool.end(); } catch (_) {}
    }
    process.exit(1);
  }
}

testAivenConnection();
