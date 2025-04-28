const pool = require('./db');

export async function processKillPlayer(){
    const connection = await pool.getConnection();
    try {
      await connection.query(
        `INSERT INTO kill_events 
        (killer_name, victim_name, is_friendly, timestamp) 
        VALUES (?, ?, ?, NOW())`,
        [eventData.instigator, eventData.player, eventData.friendly]
      );
    } finally {
      connection.release();
    }
}