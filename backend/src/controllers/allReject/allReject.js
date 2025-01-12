const { client_update } = require('../../configuration/database/databaseUpdate.js');

exports.allReject = async (req, res) => {
    const { row_ids, comments } = req.body;
    const checker = req.user.user_id;

    console.log('Received row_ids:', row_ids);

    if (!row_ids || !Array.isArray(row_ids) || row_ids.length === 0) {
        return res.status(400).json({
            success: false,
            message: 'row_ids must be a non-empty array.',
        });
    }

    try {
        await client_update.query('BEGIN');

        const results = [];
        const errors = [];

        // Process each row_id
        for (const row_id of row_ids) {
            try {
                // Get the change details
                const selectQuery = `
                    SELECT ct.table_name, ct.new_data, ct.request_id::text as request_id
                    FROM app.change_tracker ct
                    WHERE ct.row_id = $1
                    AND ct.status = 'pending';
                `;
                const selectResult = await client_update.query(selectQuery, [row_id]);

                if (selectResult.rowCount === 0) {
                    throw new Error(`No pending record found with row_id: ${row_id}`);
                }

                const { request_id } = selectResult.rows[0];

                if (!request_id) {
                    throw new Error(`Invalid data in change_tracker for row_id: ${row_id}. Missing request_id.`);
                }

                // Update change_tracker status
                const updateTrackerQuery = `
                    UPDATE app.change_tracker
                    SET 
                        status = $1,
                        comments = $2,
                        updated_at = NOW(),
                        checker = $3
                    WHERE row_id = $4
                    RETURNING *;
                `;

                const trackerValues = ['rejected', comments || null, checker, row_id];
                const trackerResult = await client_update.query(updateTrackerQuery, trackerValues);

                if (trackerResult.rowCount === 0) {
                    throw new Error(`Failed to update change_tracker for row_id: ${row_id}`);
                }

                results.push({
                    row_id,
                    success: true,
                    message: 'Rejected successfully',
                    trackerData: trackerResult.rows[0]
                });

            } catch (error) {
                console.error(`Error processing row_id ${row_id}:`, error);
                errors.push({
                    row_id,
                    error: error.message
                });
            }
        }

        // Check if all requests failed
        if (errors.length === row_ids.length) {
            // If all requests failed, rollback
            await client_update.query('ROLLBACK');
            return res.status(500).json({
                success: false,
                message: 'All rejection requests failed',
                errors
            });
        }

        // Commit if at least one request succeeded
        await client_update.query('COMMIT');

        const successCount = results.filter(result => result.success).length;
        return res.status(200).json({
            success: true,
            message: `Successfully processed ${successCount} out of ${row_ids.length} rejections`,
            results,
            errors: errors.length > 0 ? errors : undefined
        });

    } catch (error) {
        await client_update.query('ROLLBACK');
        console.error('Error in allReject controller:', error);
        return res.status(500).json({
            success: false,
            message: 'An error occurred while processing the requests',
            error: error.message
        });
    }
};