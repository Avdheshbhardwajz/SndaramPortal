const { client_update } = require('../../configuration/database/databaseUpdate.js');

exports.highlightCells = async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({
            success: false,
            message: 'User ID is required'
        });
    }

    try {
        // Query to get pending changes for the current user
        const query = `
            SELECT table_id, old_data, new_data, row_id
            FROM app.change_tracker
            WHERE maker = $1 AND status = 'pending';
        `;

        const result = await client_update.query(query, [userId]);

        // Process each row to find changed fields
        const changes = result.rows.map(row => {
            const oldData = row.old_data;
            const newData = row.new_data;
            const changedFields = [];

            // Compare old_data and new_data to find changed fields
            for (const key in newData) {
                if (JSON.stringify(oldData[key]) !== JSON.stringify(newData[key])) {
                    changedFields.push(key);
                }
            }

            return {
                table_id: row.table_id,
                row_id: row.row_id,
                changed_fields: changedFields
            };
        });

        res.status(200).json({
            success: true,
            data: changes
        });

    } catch (error) {
        console.error('Error fetching cell highlights:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch cell highlights',
            error: error.message
        });
    }
};