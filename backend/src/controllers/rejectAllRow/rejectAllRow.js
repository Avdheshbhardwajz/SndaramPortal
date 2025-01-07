const { client_update } = require('../../configuration/database/databaseUpdate.js');

exports.rejectAllRow = async (req, res) => {
    const { request_ids, comments, admin } = req.body;

    // Validate input
    if (!Array.isArray(request_ids) || request_ids.length === 0 || !comments || !admin) {
        return res.status(400).json({
            success: false,
            message: 'Required fields: request_ids (non-empty array), comments, and admin are missing or invalid.',
        });
    }

    try {
        // Start a transaction
        await client_update.query('BEGIN');

        // Update the rows with the given request_ids
        const query = `
            UPDATE app.add_row_table
            SET status = $1, comments = $2, admin = $3, updated_at = NOW()
            WHERE request_id = ANY($4::uuid[])
            RETURNING *;
        `;
        const values = ['rejected', comments, admin, request_ids];

        const result = await client_update.query(query, values);

        // Check if any rows were updated
        if (result.rowCount === 0) {
            await client_update.query('ROLLBACK');
            return res.status(404).json({
                success: false,
                message: 'No rows found with the given request_ids.',
            });
        }

        // Commit the transaction
        await client_update.query('COMMIT');

        return res.status(200).json({
            success: true,
            message: 'Rows rejected successfully.',
            data: result.rows, // Return all updated rows
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