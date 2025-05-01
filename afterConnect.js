const pool = require('./db');

async function processConnectedPlayer(player, identity) {
    const connection = await pool.getConnection();
          try {
            await connection.beginTransaction();
                await connection.query(
                    `INSERT INTO temp_player_events 
                    (player_id, player_name, event_type)
                    VALUES (?, ?, 'connect')`,
                    [identity, player]
                );
                await connection.commit();
            } catch (error) {
                await connection.rollback();
                throw error;
            } finally {
                connection.release();
        }

}
module.exports = { processConnectedPlayer };