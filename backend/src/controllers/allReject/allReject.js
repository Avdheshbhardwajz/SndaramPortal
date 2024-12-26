const { client_update } = require('../../configuration/database/databaseUpdate.js');

exports.allReject = async (req, res) => {
    const { request_ids, comments, checker } = req.body;

    if (!Array.isArray(request_ids) || request_ids.length === 0 || !checker) {
        return res.status(400).json({
            success: false,
            message: '"request_ids" must be a non-empty array and "checker" is a required field.',
        });
    }

    if (comments && comments.length > 100) {
        return res.status(400).json({
            success: false,
            message: 'Comments must not exceed 100 characters',
        });
    }

    try {
        // Start transaction
        await client_update.query('BEGIN');

        // Loop through request_ids and perform update
        const updatedRecords = [];
        for (const request_id of request_ids) {
            const updateQuery = `
                UPDATE app.change_tracker
                SET 
                    status = 'rejected',
                    comments = $1,
                    updated_at = NOW(),
                    checker = $2
                WHERE request_id = $3
                AND status = 'pending'
                RETURNING *;
            `;

            const values = [
                comments ? comments.trim().slice(0, 100) : null,
                checker,
                request_id
            ];
            
            const result = await client_update.query(updateQuery, values);

            if (result.rowCount === 0) {
                throw new Error(`No pending record found for request_id: ${request_id}`);
            }

            updatedRecords.push(result.rows[0]);
        }

        // Commit transaction
        await client_update.query('COMMIT');

        return res.status(200).json({
            success: true,
            message: 'Changes rejected successfully',
            results: updatedRecords
        });
    } catch (error) {
        await client_update.query('ROLLBACK');
        console.error('Error in bulk reject:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to reject changes'
        });
    }
};