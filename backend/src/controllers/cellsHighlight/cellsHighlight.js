const { client_update } = require('../../configuration/database/databaseUpdate.js');

exports.highlightCells = async (req, res) => {
    const { userId, tableName } = req.body;

    if (!userId || !tableName) {
        return res.status(400).json({
            success: false,
            message: 'Both User ID and Table Name are required'
        });
    }

    try {
        // Query to get pending changes for the current user and specific table
        const query = `
            SELECT table_id, old_data, new_data, row_id
            FROM app.change_tracker
            WHERE maker = $1 
            AND status = 'pending'
            AND table_id = $2;
        `;

        const result = await client_update.query(query, [userId, tableName]);

        // Create a map to group changes by row_id
        const changesMap = {};

        // Process each row and group by row_id
        result.rows.forEach(row => {
            const oldData = row.old_data;
            const newData = row.new_data;
            const rowId = row.row_id;

            if (!changesMap[rowId]) {
                changesMap[rowId] = {
                    table_id: row.table_id,
                    row_id: rowId,
                    changed_fields: new Set()
                };
            }

            // Compare old_data and new_data to find changed fields
            for (const key in newData) {
                if (JSON.stringify(oldData[key]) !== JSON.stringify(newData[key])) {
                    changesMap[rowId].changed_fields.add(key);
                }
            }
        });

        // Convert the map to array and convert Sets to arrays
        const changes = Object.values(changesMap).map(change => ({
            ...change,
            changed_fields: Array.from(change.changed_fields)
        }));

        // Log for debugging
        console.log('Highlight request:', {
            userId,
            tableName,
            changesFound: changes.length
        });

        return res.status(200).json({
            success: true,
            data: changes
        });

    } catch (error) {
        console.error('Error in highlightCells:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};