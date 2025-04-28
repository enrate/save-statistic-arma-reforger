const pool = require('./db');

async function processDisconnectedPlayer(identity) {
    const connection = await pool.getConnection();
        try {
            // 1. Обновляем время отключения
            await connection.query(
                `UPDATE player_connections 
                SET timestamp_disconnection = NOW() 
                WHERE player_id = ?`,
                [eventData.identity]
            );
    
            // 2. Получаем временные метки
            const [connectionRows] = await connection.query(
                `SELECT 
                    TIMESTAMPDIFF(SECOND, timestamp_last_connection, timestamp_disconnection) as seconds_played,
                    timestamp_last_connection,
                    timestamp_disconnection
                FROM player_connections 
                WHERE player_id = ?`,
                [eventData.identity]
            );
    
            if (connectionRows.length === 0) return;
            
            const { seconds_played } = connectionRows[0];
            const minutesPlayed = Math.floor(seconds_played / 60);
    
            // 3. Обновляем статистику
            await connection.query(
                `INSERT INTO players_stats 
                    (player_id, playedTime) 
                VALUES 
                    (?, ?) 
                ON DUPLICATE KEY UPDATE 
                    playedTime = playedTime + VALUES(playedTime)`,
                [eventData.identity, minutesPlayed]
            );
    
        } finally {
            connection.release();
        }
}

module.exports = { processDisconnectedPlayer };