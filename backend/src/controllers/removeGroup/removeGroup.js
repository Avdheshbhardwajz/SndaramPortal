const { client_update } = require('../../configuration/database/databaseUpdate.js');

exports.removeGroup = async (req, res) => {
    try {
        const { group_name } = req.body;

        if (!group_name) {
            return res.status(400).json({
                success: false,
                message: 'group_name is required.',
            });
        }

        // Start transaction
        await client_update.query('BEGIN');

        // Query to delete the row with the specified group_name
        const deleteQuery = 'DELETE FROM app.group_table WHERE group_name = $1 RETURNING *';
        const result = await client_update.query(deleteQuery, [group_name]);

        // If no rows are deleted, return a 404 response
        if (result.rowCount === 0) {
            await client_update.query('ROLLBACK');
            return res.status(404).json({
                success: false,
                message: `No group found with group_name: ${group_name}`,
            });
        }

        // Commit the transaction
        await client_update.query('COMMIT');

        // Send the deleted row(s) as a response
        return res.status(200).json({
            success: true,
            message: `Group with group_name '${group_name}' successfully removed.`,
            data: result.rows[0], // Return the deleted row
        });
    } catch (error) {
        // Rollback transaction in case of error
        await client_update.query('ROLLBACK');
        console.error('Error:', error);

        return res.status(500).json({
            success: false,
            message: 'An error occurred while processing the request.',
            error: error.message,
        });
    }
};