const { client_update } = require('../../configuration/database/databaseUpdate.js');

exports.getAllCheckerRequest = async (req, res) => {
    try {
        const { checker } = req.body;

        if (!checker) {
            return res.status(400).json({
                success: false,
                message: 'Checker value is required.',
            });
        }

        // Query the database
        const query = `
            SELECT * 
            FROM app.change_tracker 
            WHERE checker = $1
        `;
        const values = [checker];

        const result = await client_update.query(query, values);

        // Send the data as a response
        return res.status(200).json({
            success: true,
            data: result.rows,
        });

    } catch (error) {
        // Rollback transaction if required
        await client_update.query('ROLLBACK');
        console.error('Error:', error);

        return res.status(500).json({
            success: false,
            message: 'An error occurred while processing the request.',
            error: error.message,
        });
    }
};