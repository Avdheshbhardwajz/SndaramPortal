// const { client_update } = require('../../configuration/database/databaseUpdate.js');

// exports.approve = async (req, res) => {
//     const { request_id, comments, checker } = req.body;

//     if (!request_id || !checker) {
//         return res.status(400).json({
//             success: false,
//             message: '"request_id" and "checker" are required fields.',
//         });
//     }

//     try {
//         // Start transaction
//         await client_update.query('BEGIN');

//         // Update query
//         const updateQuery = `
//             UPDATE app.change_tracker
//             SET 
//                 status = $1,
//                 comments = $2,
//                 updated_at = NOW(),
//                 checker = $3
//             WHERE request_id = $4
//             RETURNING *;
//         `;

//         const values = ['approved', comments || null, checker, request_id];

//         const appSchemaResult = await client_update.query(updateQuery, values);

//         if (appSchemaResult.rowCount === 0) {
//             throw new Error('No record found with the given request_id.');
//         }

//         // Commit transaction
//         await client_update.query('COMMIT');

//         return res.status(200).json({
//             success: true,
//             message: 'Change request approved successfully',
//             trackerData: appSchemaResult.rows[0],
//         });
//     } catch (error) {
//         await client_update.query('ROLLBACK'); // Rollback transaction on error
//         console.error('Error:', error);
//         return res.status(500).json({
//             success: false,
//             message: 'An error occurred while processing the request',
//             error: error.message,
//         });
//     }
// };

const { client_update } = require('../../configuration/database/databaseUpdate.js');

exports.approve = async (req, res) => {
    const { request_id, comments, checker } = req.body;

    if (!request_id || !checker) {
        return res.status(400).json({
            success: false,
            message: '"request_id" and "checker" are required fields.',
        });
    }

    try {
        await client_update.query('BEGIN');

        const selectQuery = `
            SELECT table_name, row_id, new_data
            FROM app.change_tracker
            WHERE request_id = $1;
        `;
        const selectResult = await client_update.query(selectQuery, [request_id]);

        if (selectResult.rowCount === 0) {
            throw new Error('No record found with the given request_id.');
        }

        const { table_name, row_id, new_data } = selectResult.rows[0];

        if (!table_name || !row_id || !new_data) {
            throw new Error('Invalid data in change_tracker: table_name, row_id, or new_data is missing.');
        }


        const updates = Object.entries(new_data);

        const updateColumns = updates.map(([column, value], index) => `${column} = $${index + 1}`).join(', ');
        const updateValues = updates.map(([, value]) => value);
        updateValues.push(row_id);

        const dynamicUpdateQuery = `
            UPDATE app.${table_name}
            SET ${updateColumns}
            WHERE row_id = $${updates.length + 1};
        `;

        await client_update.query(dynamicUpdateQuery, updateValues);

        const updateTrackerQuery = `
            UPDATE app.change_tracker
            SET 
                status = $1,
                comments = $2,
                updated_at = NOW(),
                checker = $3
            WHERE request_id = $4
            RETURNING *;
        `;

        const trackerValues = ['approved', comments || null, checker, request_id];
        const trackerResult = await client_update.query(updateTrackerQuery, trackerValues);

        if (trackerResult.rowCount === 0) {
            throw new Error('Failed to update change_tracker with the given request_id.');
        }

        await client_update.query('COMMIT');

        return res.status(200).json({
            success: true,
            message: 'Change request approved and applied successfully',
            trackerData: trackerResult.rows[0],
        });
    } catch (error) {
        await client_update.query('ROLLBACK');
        console.error('Error:', error);
        return res.status(500).json({
            success: false,
            message: 'An error occurred while processing the request',
            error: error.message,
        });
    }
};