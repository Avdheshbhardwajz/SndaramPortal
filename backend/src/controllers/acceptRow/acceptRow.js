const { client_update } = require('../../configuration/database/databaseUpdate.js');

exports.acceptRow = async (req, res) => {
    try {
        const { request_id, admin, comments } = req.body;

        // Validate input
        if (!request_id || !admin) {
            return res.status(400).json({
                success: false,
                message: 'Required fields: request_id and admin are missing.',
            });
        }

        // Start a transaction
        await client_update.query('BEGIN');

        // Update the row with the given request_id
        const query = `
            UPDATE app.add_row_table
            SET status = $1, admin = $2, comments = $3, updated_at = NOW()
            WHERE request_id = $4
            RETURNING *;
        `;
        const values = ['approve', admin, comments || null, request_id];

        const result = await client_update.query(query, values);

        // Check if the row was updated
        if (result.rowCount === 0) {
            await client_update.query('ROLLBACK');
            return res.status(404).json({
                success: false,
                message: 'No row found with the given request_id.',
            });
        }

        // Commit the transaction
        await client_update.query('COMMIT');

        return res.status(200).json({
            success: true,
            message: 'Row updated successfully.',
            data: result.rows[0], // Return the updated row
        });
    } catch (error) {
        // Rollback in case of error
        await client_update.query('ROLLBACK');
        console.error('Error:', error);

        return res.status(500).json({
            success: false,
            message: 'An error occurred while processing the request.',
            error: error.message,
        });
    }
};