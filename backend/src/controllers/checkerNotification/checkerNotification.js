const { client_update } = require('../../configuration/database/databaseUpdate.js');

exports.getCheckerNotification = async (req, res) => {
    try {
        // Query to get all pending changes grouped by table
        const query = `
            SELECT 
                table_name,
                maker,
                MIN(created_at) as created_at,
                COUNT(*) as pending_count
            FROM app.change_tracker 
            WHERE status = 'pending'
            GROUP BY table_name, maker
            ORDER BY MIN(created_at) DESC
        `;

        const result = await client_update.query(query);

        return res.status(200).json({
            success: true,
            data: result.rows.map(row => ({
                table_name: row.table_name,
                maker: row.maker,
                created_at: row.created_at,
                pending_count: parseInt(row.pending_count)
            }))
        });

    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({
            success: false,
            message: 'An error occurred while processing the request.',
            error: error.message
        });
    }
};