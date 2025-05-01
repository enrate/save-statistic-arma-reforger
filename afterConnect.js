const pool = require('./db');

async function processConnectedPlayer(player, identity, platformId, platformName) {
    const connection = await pool.getConnection();
          try {
            await connection.beginTransaction();
                await connection.query(
                    `INSERT INTO temp_player_events 
                    (player_id, player_name, platformId, platformName, event_type)
                    VALUES (?, ?, ?, ?, 'connect')`,
                    [identity, player, platformId, platformName]
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