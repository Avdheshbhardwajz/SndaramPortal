const { client_update } = require('../../configuration/database/databaseUpdate.js');

exports.isActive = async (req, res) => {
    try {
        const user_id = req.user.user_id;  // Get user_id from JWT token

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
                message: 'User not found.',
            });
        }

        // Toggle the active status
        const newStatus = !currentStatus.rows[0].active;

        // Update the active status
        const updateQuery = `
            UPDATE app.users
            SET 
                active = $1,
                updated_at = NOW()
            WHERE user_id = $2
            RETURNING user_id, active;
        `;

        const result = await client_update.query(updateQuery, [newStatus, user_id]);
        await client_update.query('COMMIT');

        return res.status(200).json({
            success: true,
            message: `User ${newStatus ? 'activated' : 'deactivated'} successfully`,
            data: result.rows[0]
        });

    } catch (error) {
        await client_update.query('ROLLBACK');
        console.error('Error toggling user status:', error);
        return res.status(500).json({
            success: false,
            message: 'An error occurred while toggling user status',
            error: error.message
        });
    }
};