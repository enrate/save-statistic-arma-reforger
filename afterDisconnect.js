const pool = require('./db');

async function processDisconnectedPlayer(identity, player) {
    const connection = await pool.getConnection();
    try {
        // 1. Обновляем время отключения
        await connection.query(
            `INSERT INTO temp_player_events 
            (player_id, player_name, event_type)
            VALUES (?, ?, 'disconnect')`,
            [identity, player]
        );
        // await connection.query(
        //     `UPDATE player_connections pc
        //     JOIN players_info pi ON pc.id = pi.connection_id
        //     SET pc.timestamp_disconnection = NOW()
        //     WHERE pi.player_id = ?`,
        //     [identity]
        // );
    
        // 2. Получаем временные метки (ИСПРАВЛЕННЫЙ ЗАПРОС)
        // const [connectionRows] = await connection.query(
        //     `SELECT 
        //         TIMESTAMPDIFF(SECOND, pc.timestamp_last_connection, pc.timestamp_disconnection) as seconds_played
        //     FROM player_connections pc
        //     JOIN players_info pi ON pc.id = pi.connection_id
        //     WHERE pi.player_id = ?`,
        //     [identity]
        // );
    
        // if (connectionRows.length === 0) return;
        
        // const { seconds_played } = connectionRows[0];
        // const minutesPlayed = Math.floor(seconds_played / 60);
    
        // // 3. Обновляем статистику
        // await connection.query(
        //     `UPDATE players_stats 
        //     SET playedTime = playedTime + ?
        //     WHERE player_id = ?`,
        //     [minutesPlayed, identity]
        // );
    
    } finally {
        connection.release();
    }
}

module.exports = { processDisconnectedPlayer };