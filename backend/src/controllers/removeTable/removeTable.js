const { client_update } = require('../../configuration/database/databaseUpdate.js');

exports.removeTable = async (req, res) => {
    try {
        const { group_name, table_name } = req.body;

        // Validate input
        if (!group_name || !table_name) {
            return res.status(400).json({
                success: false,
                message: 'Both group_name and table_name are required.',
            });
        }

        // Start transaction
        await client_update.query('BEGIN');

        // Find the row with the given group_name
        const findQuery = 'SELECT * FROM app.group_table WHERE group_name = $1';
        const findResult = await client_update.query(findQuery, [group_name]);

        if (findResult.rowCount === 0) {
            await client_update.query('ROLLBACK');
            return res.status(404).json({
                success: false,
                message: `No group found with group_name: ${group_name}`,
            });
        }

        // Update the table_list array by removing the specified table_name
        const updateQuery = `
            UPDATE app.group_table
            SET table_list = table_list::jsonb - $2::text
            WHERE group_name = $1
            RETURNING *;
        `;
        const updateResult = await client_update.query(updateQuery, [group_name, table_name]);

        if (updateResult.rowCount === 0) {
            await client_update.query('ROLLBACK');
            return res.status(400).json({
                success: false,
                message: `The table_name '${table_name}' does not exist in the table_list.`,
            });
        }

        // Commit the transaction
        await client_update.query('COMMIT');

        // Send the updated row as a response
        return res.status(200).json({
            success: true,
            message: `Table name '${table_name}' successfully removed from table_list in group '${group_name}'.`,
            data: updateResult.rows[0], // Return the updated row
        });
    } catch (error) {
        // Rollback transaction on error
        await client_update.query('ROLLBACK');
        console.error('Error:', error);

        return res.status(500).json({
            success: false,
            message: 'An error occurred while processing the request.',
            error: error.message,
        });
    }
};