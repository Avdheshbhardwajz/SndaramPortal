const { client_update } = require('../../configuration/database/databaseUpdate.js');
const { v4: uuidv4 } = require('uuid');

exports.requestData = async (req, res) => {
    const {
        table_name,
        row_id,
        old_values,
        new_values,
        table_id
    } = req.body;

    const maker = req.user.user_id;  // Get maker ID from JWT token

    if (!table_name) {
        return res.status(400).json({
            success: false,
            message: 'table_name is required',
        });
    }

    try {
        if (!client_update || client_update.ended) {
            throw new Error('Database client is not connected');
        }

        // Validate table_name length according to schema
        if (table_name.length > 100) {
            return res.status(400).json({
                success: false,
                message: 'Table name cannot exceed 100 characters'
            });
        }

        const insertQuery = `
            INSERT INTO app.change_tracker (
                request_id,
                table_name,
                row_id,
                old_data,
                new_data,
                status,
                maker,
                created_at,
                updated_at,
                table_id
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, $8)
            RETURNING *;
        `;

        const request_id = uuidv4();
        const values = [
            request_id,
            table_name,
            row_id ? String(row_id) : null,
            old_values ? JSON.stringify(old_values) : null,
            new_values ? JSON.stringify(new_values) : null,
            'pending',
            maker,
            table_id ? String(table_id) : null
        ];

        const result = await client_update.query(insertQuery, values);

        return res.status(201).json({
            success: true,
            message: 'Change request created successfully',
            data: result.rows[0]
        });

    } catch (error) {
        console.error('Error creating change request:', error);
        return res.status(500).json({
            success: false,
            message: 'An error occurred while creating the change request',
            error: error.message
        });
    }
};