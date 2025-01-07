const { client_update } = require('../../configuration/database/databaseUpdate.js');

exports.isActive = async (req, res) => {
    try {
        const { user_id, active } = req.body;

        if (!user_id || typeof active !== 'boolean') {
            return res.status(400).json({
                success: false,
                message: 'Required fields: user_id and active (boolean) are missing or invalid.',
            });
        }

        await client_update.query('BEGIN');

        const query = `
            UPDATE app.users
            SET active = $1, updated_at = NOW()
            WHERE user_id = $2
            RETURNING *;
        `;
        const values = [active, user_id];

        const result = await client_update.query(query, values);

        if (result.rowCount === 0) {
            await client_update.query('ROLLBACK');
            return res.status(404).json({
                success: false,
                message: 'No user found with the given user_id.',
            });
        }

        await client_update.query('COMMIT');

        return res.status(200).json({
            success: true,
            message: 'User status updated successfully.',
            data: result.rows[0],
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