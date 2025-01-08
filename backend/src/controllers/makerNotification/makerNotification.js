const { client_update } = require('../../configuration/database/databaseUpdate.js');

exports.getMakerNotification = async (req, res) => {
    try {
        const { maker_id } = req.body;

        if (!maker_id) {
            return res.status(400).json({
                success: false,
                message: 'Maker ID is required.',
            });
        }

        // Query for change_tracker table
        const changeTrackerQuery = `
            SELECT 
                table_name,
                status,
                checker as approver,
                updated_at,
                old_data,
                new_data,
                comments,
                request_id
            FROM app.change_tracker 
            WHERE maker = $1 
            AND status IN ('approved', 'rejected')
            ORDER BY updated_at DESC
        `;

        // Query for add_row_table
        const addRowQuery = `
            SELECT 
                table_name,
                status,
                admin as approver,
                updated_at,
                row_data as data,
                comments,
                request_id
            FROM app.add_row_table 
            WHERE maker = $1 
            AND status IN ('approved', 'rejected')
            ORDER BY updated_at DESC
        `;

        // Execute both queries
        const [changeTrackerResults, addRowResults] = await Promise.all([
            client_update.query(changeTrackerQuery, [maker_id]),
            client_update.query(addRowQuery, [maker_id])
        ]);

        // Function to get changed key-value pairs
        const getChangedData = (oldData, newData) => {
            const changedData = {};
            if (!oldData || !newData) return newData || {};

            // Parse JSON strings if they're not already objects
            const oldObj = typeof oldData === 'string' ? JSON.parse(oldData) : oldData;
            const newObj = typeof newData === 'string' ? JSON.parse(newData) : newData;

            // Compare and collect changed key-value pairs
            Object.keys(newObj).forEach(key => {
                if (JSON.stringify(oldObj[key]) !== JSON.stringify(newObj[key])) {
                    changedData[key] = newObj[key];
                }
            });

            return changedData;
        };

        // Combine results
        const combinedResults = [
            ...changeTrackerResults.rows.map(row => ({
                ...row,
                source: 'change_tracker',
                data: getChangedData(row.old_data, row.new_data)
            })),
            ...addRowResults.rows.map(row => ({
                ...row,
                source: 'add_row_table'
            }))
        ];

        // Sort by updated_at in descending order (most recent first)
        combinedResults.sort((a, b) => 
            new Date(b.updated_at) - new Date(a.updated_at)
        );

        return res.status(200).json({
            success: true,
            data: combinedResults.map(row => ({
                table_name: row.table_name,
                status: row.status,
                approver: row.approver,
                updated_at: row.updated_at,
                data: row.data,
                request_id: row.request_id,
                source: row.source,
                ...(row.status === 'rejected' && { comments: row.comments })
            }))
        });

    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({
            success: false,
            message: 'An error occurred while processing the request.',
            error: error.message
        });
    }
};
