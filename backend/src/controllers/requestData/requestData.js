const { client_update } = require('../../configuration/database/databaseUpdate.js');
const { v4: uuidv4 } = require('uuid');

exports.requestData = async (req, res) => {
    const {
        request_id,
        table_name,
        row_id,
        old_values,
        new_values,
        status,
        maker_id,
        checker_id,
        created_at,
        updated_at,
        comments,
        table_id
    } = req.body;

    if (!table_name || !maker_id) {
        return res.status(400).json({
            success: false,
            message: 'table_name and maker are required fields',
        });
    }

    try {
        if (!client_update || client_update.ended) {
            throw new Error('Database client is not connected');
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
                checker,
                created_at,
                updated_at,
                comments,
                table_id
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW(), $9, $10)
            RETURNING *;
        `;

        const values = [
            uuidv4(),
            table_name,
            row_id,
            JSON.stringify(old_values),
            JSON.stringify(new_values),
            'pending',
            maker_id,
            checker_id || null,
            comments || '',
            table_id || table_name // Use table_id if provided, otherwise use table_name
        ];

        const result = await client_update.query(insertQuery, values);

        res.status(200).json({
            success: true,
            message: 'Data inserted successfully',
            data: result.rows[0],
        });
    } catch (error) {
        console.error('Error in requestData:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Internal server error',
        });
    }
};