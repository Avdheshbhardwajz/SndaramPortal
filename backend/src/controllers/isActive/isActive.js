const { client_update } = require('../../configuration/database/databaseUpdate.js');

exports.isActive = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    await client_update.query('BEGIN');

    // First get the current active status
    const currentStatusQuery = `
      SELECT active 
      FROM app.users 
      WHERE email = $1
    `;
    const currentStatusResult = await client_update.query(currentStatusQuery, [email]);

    if (currentStatusResult.rowCount === 0) {
      await client_update.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const currentActive = currentStatusResult.rows[0].active;
    const newActive = !currentActive;

    // Update the active status
    const updateQuery = `
      UPDATE app.users 
      SET active = $1, 
          updated_at = NOW() 
      WHERE email = $2 
      RETURNING user_id, active, updated_at
    `;
    const result = await client_update.query(updateQuery, [newActive, email]);
    
    if (result.rowCount === 0) {
      await client_update.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: "Failed to update user status",
      });
    }

    await client_update.query('COMMIT');

    return res.status(200).json({
      success: true,
      message: `User ${newActive ? 'activated' : 'deactivated'} successfully`,
      data: result.rows[0]
    });

  } catch (error) {
    await client_update.query('ROLLBACK');
    console.error('Error in isActive:', error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};