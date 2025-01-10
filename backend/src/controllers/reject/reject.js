const { client_update } = require('../../configuration/database/databaseUpdate.js');

exports.reject = async (req, res) => {
    const { request_id, comments } = req.body;
    const checker = req.user.user_id;  // Get checker ID from JWT token

    if (!request_id) {
        return res.status(400).json({
            success: false,
            message: 'request_id is required.',
        });
    }

    // Validate comments length according to schema
    if (comments && comments.length > 1000) {
        return res.status(400).json({
            success: false,
            message: 'Comments cannot exceed 1000 characters'
        });
    }

    try {
        // Start transaction
        await client_update.query('BEGIN');

        // First verify the request exists and is pending
        const verifyQuery = `
            SELECT status
            FROM app.change_tracker
            WHERE request_id = $1;
        `;
        const verifyResult = await client_update.query(verifyQuery, [request_id]);

        if (verifyResult.rowCount === 0) {
            throw new Error('No record found with the given request_id.');
        }

        if (verifyResult.rows[0].status !== 'pending') {
            throw new Error('This request has already been processed.');
        }

        // Update query
        const updateQuery = `
            UPDATE app.change_tracker
            SET 
                status = 'rejected',
                comments = $1,
                updated_at = CURRENT_TIMESTAMP,
                checker = $2
            WHERE request_id = $3
            RETURNING *;
        `;

        const values = [comments || null, checker, request_id];
        const result = await client_update.query(updateQuery, values);

        // Commit transaction
        await client_update.query('COMMIT');

        return res.status(200).json({
            success: true,
            message: 'Change request rejected successfully',
            data: result.rows[0]
        });
    } catch (error) {
        await client_update.query('ROLLBACK');
        console.error('Error during rejection:', error);
        return res.status(500).json({
            success: false,
            message: 'An error occurred while processing the rejection',
            error: error.message
        });
    }
};