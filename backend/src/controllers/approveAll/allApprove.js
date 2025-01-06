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

        const results = [];

        for (const request_id of request_ids) {
            try {
                // Retrieve data from change_tracker
                const selectQuery = `
                    SELECT table_name, row_id, new_data
                    FROM app.change_tracker
                    WHERE request_id = $1;
                `;
                const selectResult = await client_update.query(selectQuery, [request_id]);

                if (selectResult.rowCount === 0) {
                    throw new Error(`No record found for request_id: ${request_id}`);
                }

                const { table_name, row_id, new_data } = selectResult.rows[0];

                if (!table_name || !row_id || !new_data) {
                    throw new Error(
                        `Invalid data in change_tracker for request_id: ${request_id}. Missing table_name, row_id, or new_data.`
                    );
                }

                // Parse new_data
                const updates = Object.entries(new_data);

                // Construct dynamic SQL
                const updateColumns = updates
                    .map(([column, value], index) => `${column} = $${index + 1}`)
                    .join(', ');
                const updateValues = updates.map(([, value]) => value);
                updateValues.push(row_id);

                const dynamicUpdateQuery = `
                    UPDATE app.${table_name}
                    SET ${updateColumns}
                    WHERE row_id = $${updates.length + 1};
                `;
                await client_update.query(dynamicUpdateQuery, updateValues);

                // Update change_tracker status
                const updateTrackerQuery = `
                    UPDATE app.change_tracker
                    SET 
                        status = $1,
                        updated_at = NOW(),
                        checker = $2
                    WHERE request_id = $3
                    RETURNING *;
                `;
                const trackerResult = await client_update.query(updateTrackerQuery, ['approved', checker, request_id]);

                if (trackerResult.rowCount === 0) {
                    throw new Error(`Failed to update change_tracker for request_id: ${request_id}`);
                }

                results.push({
                    request_id,
                    success: true,
                    trackerData: trackerResult.rows[0],
                });
            } catch (innerError) {
                console.error(`Error processing request_id ${request_id}:`, innerError);
                results.push({
                    request_id,
                    success: false,
                    error: innerError.message,
                });
            }
        }

        // Commit transaction
        await client_update.query('COMMIT');

        return res.status(200).json({
            success: true,
            message: 'Change requests processed successfully',
            results,
        });
    } catch (error) {
        await client_update.query('ROLLBACK');
        console.error('Error:', error);
        return res.status(500).json({
            success: false,
            message: 'An error occurred while processing the requests',
            error: error.message,
        });
    }
};