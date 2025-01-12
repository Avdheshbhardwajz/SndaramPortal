const { client_update } = require('../../configuration/database/databaseUpdate.js');

exports.allApprove = async (req, res) => {
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

                const { table_name, new_data, request_id } = selectResult.rows[0];

                if (!table_name || !new_data || !request_id) {
                    throw new Error(`Invalid data in change_tracker for row_id: ${row_id}. Missing required fields.`);
                }

                // Get column types
                const columnTypesQuery = `
                    SELECT column_name, data_type, udt_name
                    FROM information_schema.columns
                    WHERE table_schema = 'app'
                    AND table_name = $1;
                `;
                const columnTypesResult = await client_update.query(columnTypesQuery, [table_name]);
                
                const columnTypes = columnTypesResult.rows.reduce((acc, col) => {
                    acc[col.column_name] = col.udt_name;
                    return acc;
                }, {});

                // Determine the SK column name based on table name
                const skColumnName = `${table_name}_sk`;
                console.log('Using SK column:', skColumnName);

                // Verify that the SK column exists
                if (!columnTypes[skColumnName]) {
                    throw new Error(`SK column ${skColumnName} not found in table ${table_name}`);
                }

                // Prepare updates
                const updates = Object.entries(new_data)
                    .filter(([column]) => column !== 'request_id' && column !== 'row_id')
                    .map(([column, value]) => {
                        return [column, value];
                    });

                if (updates.length === 0) {
                    console.log(`No columns to update for row_id: ${row_id}`);
                    continue;
                }

                const updateColumns = updates.map(([column], index) => `${column} = $${index + 1}`).join(', ');
                const updateValues = updates.map(([, value]) => value);
                updateValues.push(row_id); // Add row_id for WHERE clause

                // Use the SK column in the WHERE clause
                const whereClause = `WHERE ${skColumnName} = $${updates.length + 1}`;

                const dynamicUpdateQuery = `
                    UPDATE app.${table_name}
                    SET ${updateColumns}
                    ${whereClause}
                    RETURNING *;
                `;

                const updateResult = await client_update.query(dynamicUpdateQuery, updateValues);

                if (updateResult.rowCount === 0) {
                    throw new Error(`Failed to update record in ${table_name}`);
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

                const trackerValues = ['approved', comments || null, checker, row_id];
                const trackerResult = await client_update.query(updateTrackerQuery, trackerValues);

                if (trackerResult.rowCount === 0) {
                    throw new Error(`Failed to update change_tracker for row_id: ${row_id}`);
                }

                results.push({
                    row_id,
                    success: true,
                    message: 'Approved successfully',
                    trackerData: trackerResult.rows[0],
                    updatedRecord: updateResult.rows[0]
                });

            } catch (error) {
                console.error(`Error processing row_id ${row_id}:`, error);
                errors.push({
                    row_id,
                    error: error.message
                });
            }
        }

        if (errors.length === row_ids.length) {
            // If all requests failed, rollback
            await client_update.query('ROLLBACK');
            return res.status(500).json({
                success: false,
                message: 'All approval requests failed',
                errors
            });
        }

        // Commit if at least one request succeeded
        await client_update.query('COMMIT');

        const successCount = results.filter(result => result.success).length;
        return res.status(200).json({
            success: true,
            message: `Successfully processed ${successCount} out of ${row_ids.length} approvals`,
            results,
            errors: errors.length > 0 ? errors : undefined
        });

    } catch (error) {
        await client_update.query('ROLLBACK');
        console.error('Error in allApprove controller:', error);
        return res.status(500).json({
            success: false,
            message: 'An error occurred while processing the requests',
            error: error.message
        });
    }
};