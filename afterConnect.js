const pool = require('./db');

async function processConnectedPlayer(player, identity) {
    const connection = await pool.getConnection();
          try {
            await connection.beginTransaction();

            const [checkCreatedResults] = await connection.query(
                `SELECT connection_id
                FROM players_info
                WHERE player.id = ?`,
                [identity]
            );
            if (checkCreatedResults.length === 0) {
                // 1. Создаем запись подключения
                const [connectionResult] = await connection.query(
                    `INSERT INTO player_connections 
                    (timestamp_first_connection, timestamp_last_connection)
                    VALUES (NOW(), NOW())`
                );
                
                const connectionId = connectionResult.insertId;
                
                const [infoResult] = await connection.query(
                    `INSERT INTO players_info 
                    (connection_id, player_id, player_name)
                    VALUES (?, ?, ?)`,
                    [connectionId, identity, player]
                );
                
                const [statsResult] = await connection.query(
                    `INSERT INTO players_stats (player_id)
                    VALUES (?)
                    ON DUPLICATE KEY UPDATE player_id = VALUES(player_id)`,
                    [identity]
                );
                
                await connection.query(
                    `UPDATE players_info
                    SET stats_id = ?
                    WHERE id = ?`,
                    [statsResult.insertId, infoResult.insertId]
                );
                
            } else {
                await connection.query(
                    `UPDATE player_connections pc
                    JOIN players_info pi ON pc.id = pi.connection_id
                    SET pc.timestamp_last_connection = NOW()
                    WHERE pi.player_id = ?`,
                    [identity]
                );
            }
                await connection.commit();
            } catch (error) {
                await connection.rollback();
                throw error;
            } finally {
                connection.release();
        }

}
module.exports = { processConnectedPlayer };