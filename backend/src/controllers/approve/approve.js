const { client_update } = require('../../configuration/database/databaseUpdate.js');

exports.approve = async (req, res) => {
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
        await client_update.query('BEGIN');

        // First verify the request exists and is pending
        const verifyQuery = `
            SELECT table_name, row_id, new_data, status
            FROM app.change_tracker
            WHERE request_id = $1;
        `;
        const verifyResult = await client_update.query(verifyQuery, [request_id]);

        if (verifyResult.rowCount === 0) {
            throw new Error('No record found with the given request_id.');
        }

        const { table_name, row_id, new_data, status } = verifyResult.rows[0];

        if (status !== 'pending') {
            throw new Error('This request has already been processed.');
        }

        // Update the change_tracker table
        const updateTrackerQuery = `
            UPDATE app.change_tracker
            SET 
                status = 'approved',
                comments = $1,
                updated_at = CURRENT_TIMESTAMP,
                checker = $2
            WHERE request_id = $3
            RETURNING *;
        `;

        const trackerResult = await client_update.query(updateTrackerQuery, [
            comments || null,
            checker,
            request_id
        ]);

        // Update the target table with new data
        if (new_data && row_id) {
            const parsedData = typeof new_data === 'string' ? JSON.parse(new_data) : new_data;
            const columns = Object.keys(parsedData);
            const values = Object.values(parsedData);
            
            const setClause = columns.map((col, idx) => `${col} = $${idx + 2}`).join(', ');
            const updateTableQuery = `
                UPDATE ${table_name}
                SET ${setClause}
                WHERE row_id = $1;
            `;

            await client_update.query(updateTableQuery, [row_id, ...values]);
        }

        await client_update.query('COMMIT');

        return res.status(200).json({
            success: true,
            message: 'Change request approved successfully',
            data: trackerResult.rows[0]
        });

    } catch (error) {
        await client_update.query('ROLLBACK');
        console.error('Error during approval:', error);
        return res.status(500).json({
            success: false,
            message: 'An error occurred while processing the approval',
            error: error.message
        });
    }
};