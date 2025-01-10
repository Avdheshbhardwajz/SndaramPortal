const { client_update } = require('../../configuration/database/databaseUpdate.js');
const { v4: uuidv4 } = require('uuid');

exports.addRow = async (req, res) => {
    const { table_name, row_data } = req.body;
    const maker = req.user.user_id;  // Get maker ID from JWT token

    if (!table_name || !row_data) {
        return res.status(400).json({
            success: false,
            message: 'Required fields: table_name and row_data are missing.',
        });
    }

    // Validate table_name length according to schema
    if (table_name.length > 50) {
        return res.status(400).json({
            success: false,
            message: 'Table name cannot exceed 50 characters'
        });
    }

    try {
        // Start a transaction
        await client_update.query('BEGIN');

        const request_id = uuidv4();
        
        // Insert into the table
        const query = `
            INSERT INTO app.add_row_table (
                request_id, 
                table_name, 
                row_data, 
                status, 
                maker, 
                created_at, 
                updated_at
            )
            VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            RETURNING *;
        `;

        const values = [
            request_id,
            table_name,
            JSON.stringify(row_data),
            'pending',
            maker
        ];

        const result = await client_update.query(query, values);

        // Commit the transaction
        await client_update.query('COMMIT');

        return res.status(201).json({
            success: true,
            message: 'Row addition request created successfully',
            data: result.rows[0]
        });
    } catch (error) {
        // Rollback in case of error
        await client_update.query('ROLLBACK');
        console.error('Error during row addition:', error);

        return res.status(500).json({
            success: false,
            message: 'An error occurred while processing the row addition',
            error: error.message
        });
    }
};