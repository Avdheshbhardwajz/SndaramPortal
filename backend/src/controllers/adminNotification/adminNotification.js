const { client_update } = require('../../configuration/database/databaseUpdate.js');

exports.getAdminNotification = async (req, res) => {
    try {
        // Query to get pending rows grouped by table
        const query = `
            WITH TableCounts AS (
                SELECT 
                    table_name,
                    COUNT(*) as pending_count
                FROM app.add_row_table 
                WHERE status = 'pending'
                GROUP BY table_name
            ),
            FirstRequests AS (
                SELECT DISTINCT ON (table_name)
                    table_name,
                    maker,
                    created_at
                FROM app.add_row_table
                WHERE status = 'pending'
                ORDER BY table_name, created_at ASC
            )
            SELECT 
                f.table_name,
                f.maker,
                f.created_at,
                t.pending_count
            FROM FirstRequests f
            JOIN TableCounts t ON f.table_name = t.table_name
            ORDER BY f.created_at DESC
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