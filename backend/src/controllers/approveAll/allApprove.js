const { client_update } = require('../../configuration/database/databaseUpdate.js');

exports.allApprove = async (req, res) => {
    const { request_ids, checker } = req.body;

    if (!Array.isArray(request_ids) || request_ids.length === 0 || !checker) {
        return res.status(400).json({
            success: false,
            message: '"request_ids" must be a non-empty array, and "checker" is required.',
        });
    }

    try {
        // Start transaction
        await client_update.query('BEGIN');

        // Initialize a results array to store responses for each request_id
        const results = [];

        for (const request_id of request_ids) {
            // Update status in change_tracker
            const updateQuery = `
                UPDATE app.change_tracker
                SET 
                    status = 'approved',
                    updated_at = NOW(),
                    checker = $1
                WHERE request_id = $2
                AND status = 'pending'
                RETURNING *;
            `;

            const result = await client_update.query(updateQuery, [checker, request_id]);

            if (result.rowCount === 0) {
                throw new Error(`No pending record found for request_id: ${request_id}`);
            }

            results.push({
                request_id,
                success: true,
                data: result.rows[0]
            });
        }

        // Commit transaction
        await client_update.query('COMMIT');

        return res.status(200).json({
            success: true,
            message: 'Changes approved successfully',
            results
        });
    } catch (error) {
        await client_update.query('ROLLBACK');
        console.error('Error in bulk approve:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to approve changes'
        });
    }
};