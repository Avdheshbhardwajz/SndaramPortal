const { client_update } = require('../../configuration/database/databaseUpdate.js');

exports.fetchRowRequest = async (req, res) => {
    try {
        // Query to fetch all pending rows across all tables
        const query = `
            SELECT * 
            FROM app.add_row_table
            WHERE status = 'pending'
            ORDER BY created_at DESC;
        `;

        const result = await client_update.query(query);

        // Return the fetched rows
        return res.status(200).json({
            success: true,
            message: 'Pending requests fetched successfully.',
            data: result.rows, // Array of rows
        });
    } catch (error) {
        // Rollback transaction if required
        await client_update.query('ROLLBACK');
        console.error('Error:', error);

        return res.status(500).json({
            success: false,
            message: 'An error occurred while processing the request.',
            error: error.message,
        });
    }
};