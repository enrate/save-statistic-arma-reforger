const pool = require('./db');

async function processKillPlayer(){
    const connection = await pool.getConnection();
    try {
      await connection.query(
        `INSERT INTO kill_events 
        (killer_name, victim_name, is_friendly, timestamp) 
        VALUES (?, ?, ?, NOW())`,
        [instigator, player, friendly]
      );
    } finally {
      connection.release();
    }
}
module.exports = { processKillPlayer };