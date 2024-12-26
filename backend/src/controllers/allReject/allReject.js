const { client_update } = require('../../configuration/database/databaseUpdate.js');

exports.allReject = async (req, res) => {
    const { request_ids, comments, checker } = req.body;

    if (!Array.isArray(request_ids) || request_ids.length === 0 || !checker) {
        return res.status(400).json({
            success: false,
            message: '"request_ids" must be a non-empty array and "checker" is a required field.',
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
                    status = $1,
                    comments = $2,
                    updated_at = NOW(),
                    checker = $3
                WHERE request_id = $4
                RETURNING *;
            `;

            const values = ['rejected', comments || null, checker, request_id];

            const appSchemaResult = await client_update.query(updateQuery, values);

            if (appSchemaResult.rowCount === 0) {
                throw new Error(`No record found with the given request_id: ${request_id}`);
            }

            updatedRecords.push(appSchemaResult.rows[0]);
        }

        // Commit transaction
        await client_update.query('COMMIT');

        return res.status(200).json({
            success: true,
            message: 'Change requests rejected successfully',
            trackerData: updatedRecords,
        });
    } catch (error) {
        console.error('Error:', error);

        // Rollback transaction in case of an error
        await client_update.query('ROLLBACK');

        res.status(500).json({
            success: false,
            message: 'An error occurred while processing the request',
            error: error.message,
        });
    }
};