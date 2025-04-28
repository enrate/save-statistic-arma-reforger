const pool = require('./db');

async function processConnectedPlayer(player, identity) {
    const connection = await pool.getConnection();
          try {
              await connection.query(
                  `INSERT INTO player_connections 
                  (player_id, player_name, timestamp_first_connection, timestamp_last_connection) 
                  VALUES (?, ?, NOW(), NOW())
                  ON DUPLICATE KEY UPDATE 
                      timestamp_last_connection = NOW(),
                      player_name = VALUES(player_name)`,
                  [identity, player]
              );
          } finally {
              connection.release();
          }
}
module.exports = { processConnectedPlayer };