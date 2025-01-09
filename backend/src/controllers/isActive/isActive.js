const { client_update } = require('../../configuration/database/databaseUpdate.js');

exports.isActive = async (req, res) => {
    try {
        const { user_id } = req.body;

        if (!user_id) {
            return res.status(400).json({
                success: false,
                message: 'Required field: user_id is missing.',
            });
        }

        await client_update.query('BEGIN');

        // First, get the current active status
        const getCurrentStatus = `
            SELECT active 
            FROM app.users 
            WHERE user_id = $1;
        `;
        const currentStatus = await client_update.query(getCurrentStatus, [user_id]);

        if (currentStatus.rowCount === 0) {
            await client_update.query('ROLLBACK');
            return res.status(404).json({
                success: false,
                message: 'No user found with the given user_id.',
            });
        }

        // Toggle the active status to its opposite
        const newActiveStatus = !currentStatus.rows[0].active;

        // Update with the new status
        const updateQuery = `
            UPDATE app.users
            SET active = $1, updated_at = NOW()
            WHERE user_id = $2
            RETURNING *;
        `;
        const result = await client_update.query(updateQuery, [newActiveStatus, user_id]);

        await client_update.query('COMMIT');

        return res.status(200).json({
            success: true,
            message: `User ${newActiveStatus ? 'enabled' : 'disabled'} successfully.`,
            data: {
                isActive: newActiveStatus
            }
        });
    } catch (error) {
        await client_update.query('ROLLBACK');
        console.error('Error:', error);

        return res.status(500).json({
            success: false,
            message: 'An error occurred while processing the request.',
            error: error.message,
        });
    }
};