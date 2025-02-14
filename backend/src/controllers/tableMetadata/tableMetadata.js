const {
  client_update,
} = require("../../configuration/database/databaseUpdate.js");

/**
 * Add or update table metadata including display name and description
 */
exports.renameTable = async (req, res) => {
  const { original_table_name, display_name, description } = req.body;

  // Validate required fields
  if (!original_table_name || !display_name) {
    return res.status(400).json({
      success: false,
      message: "Both original_table_name and display_name are required",
    });
  }

  try {
    await client_update.query("BEGIN");

    // Check if the original table exists in the database
    const tableExistsQuery = `
            SELECT EXISTS (
                SELECT 1 
                FROM information_schema.tables 
                WHERE table_schema = 'app' 
                AND table_name = $1
            );
        `;
    const tableExists = await client_update.query(tableExistsQuery, [
      original_table_name,
    ]);

    if (!tableExists.rows[0].exists) {
      await client_update.query("ROLLBACK");
      return res.status(404).json({
        success: false,
        message: `Table "${original_table_name}" does not exist in the database`,
      });
    }

    // Upsert the metadata
    const upsertQuery = `
            INSERT INTO app.table_metadata 
                (original_table_name, display_name, description)
            VALUES ($1, $2, $3)
            ON CONFLICT (original_table_name) 
            DO UPDATE SET 
                display_name = EXCLUDED.display_name,
                description = EXCLUDED.description,
                updated_at = CURRENT_TIMESTAMP
            RETURNING *;
        `;

    const result = await client_update.query(upsertQuery, [
      original_table_name,
      display_name,
      description || null,
    ]);

    await client_update.query("COMMIT");

    return res.status(200).json({
      success: true,
      message: "Table metadata updated successfully",
      data: result.rows[0],
    });
  } catch (error) {
    await client_update.query("ROLLBACK");
    console.error("Error in renameTable:", error);

    // Handle unique constraint violations
    if (error.code === "23505") {
      // unique violation
      return res.status(409).json({
        success: false,
        message: "Display name already exists for another table",
        error: error.detail,
      });
    }

    return res.status(500).json({
      success: false,
      message: "An error occurred while updating table metadata",
      error: error.message,
    });
  }
};

/**
 * Get all table metadata entries
 */
exports.getRenamedTables = async (req, res) => {
  try {
    const query = `
            SELECT 
                id,
                original_table_name,
                display_name,
                description,
                created_at,
                updated_at
            FROM app.table_metadata
            ORDER BY created_at DESC;
        `;

    const result = await client_update.query(query);

    return res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("Error in getRenamedTables:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching table metadata",
      error: error.message,
    });
  }
};

/**
 * Delete a table metadata entry
 */
exports.deleteRenamedTable = async (req, res) => {
  const { id } = req.params;

  try {
    await client_update.query("BEGIN");

    // First check if the entry exists
    const checkQuery = `
      SELECT original_table_name 
      FROM app.table_metadata 
      WHERE id = $1;
    `;
    const checkResult = await client_update.query(checkQuery, [id]);

    if (checkResult.rowCount === 0) {
      await client_update.query("ROLLBACK");
      return res.status(404).json({
        success: false,
        message: "Table metadata entry not found",
      });
    }

    // Delete the entry
    const deleteQuery = `
      DELETE FROM app.table_metadata 
      WHERE id = $1 
      RETURNING *;
    `;
    const result = await client_update.query(deleteQuery, [id]);

    await client_update.query("COMMIT");

    return res.status(200).json({
      success: true,
      message: "Table metadata deleted successfully",
      data: result.rows[0],
    });
  } catch (error) {
    await client_update.query("ROLLBACK");
    console.error("Error in deleteRenamedTable:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while deleting table metadata",
      error: error.message,
    });
  }
};

/**
 * Update a table metadata entry
 */
exports.updateRenamedTable = async (req, res) => {
  const { id } = req.params;
  const { display_name, description } = req.body;

  // Validate required fields
  if (!display_name) {
    return res.status(400).json({
      success: false,
      message: "display_name is required",
    });
  }

  try {
    await client_update.query("BEGIN");

    // First check if the entry exists
    const checkQuery = `
      SELECT original_table_name 
      FROM app.table_metadata 
      WHERE id = $1;
    `;
    const checkResult = await client_update.query(checkQuery, [id]);

    if (checkResult.rowCount === 0) {
      await client_update.query("ROLLBACK");
      return res.status(404).json({
        success: false,
        message: "Table metadata entry not found",
      });
    }

    // Update the entry
    const updateQuery = `
      UPDATE app.table_metadata 
      SET 
        display_name = $1,
        description = $2,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *;
    `;

    const result = await client_update.query(updateQuery, [
      display_name,
      description || null,
      id,
    ]);

    await client_update.query("COMMIT");

    return res.status(200).json({
      success: true,
      message: "Table metadata updated successfully",
      data: result.rows[0],
    });
  } catch (error) {
    await client_update.query("ROLLBACK");
    console.error("Error in updateRenamedTable:", error);

    // Handle unique constraint violation for display_name
    if (error.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "Display name already exists for another table",
        error: error.detail,
      });
    }

    return res.status(500).json({
      success: false,
      message: "An error occurred while updating table metadata",
      error: error.message,
    });
  }
};
