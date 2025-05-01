const pool = require('./db');

async function processDisconnectedPlayer(identity, player) {
    const connection = await pool.getConnection();
    try {
        await connection.query(
            `INSERT INTO temp_player_events 
            (player_id, player_name, event_type)
            VALUES (?, ?, 'disconnect')`,
            [identity, player]
        );
    } finally {
        connection.release();
    }
}

module.exports = { processDisconnectedPlayer };