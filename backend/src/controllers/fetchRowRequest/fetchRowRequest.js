const { client_update } = require('../../configuration/database/databaseUpdate.js');

exports.fetchRowRequest = async (req, res) => {
    try {
        const { table_name } = req.body;

        // Validate input
        if (!table_name) {
            return res.status(400).json({
                success: false,
                message: 'Required field: table_name is missing.',
            });
        }

        // Query to fetch rows with the same table_name
        const query = `
            SELECT * 
            FROM app.add_row_table
            WHERE table_name = $1;
        `;
        const values = [table_name];

        const result = await client_update.query(query, values);

        // Return the fetched rows
        return res.status(200).json({
            success: true,
            message: 'Rows fetched successfully.',
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