const { client_update } = require('../../configuration/database/databaseUpdate.js');

exports.table = async (req, res) => {
    try {
        const query = `
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE';
      `;

        const result = await client_update.query(query);
        res.status(200).json({
            success: true,
            tables: result.rows,
        });
    } catch (error) {
        console.error('Error fetching table names:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch table names',
            error: error.message,
        });
    }
}