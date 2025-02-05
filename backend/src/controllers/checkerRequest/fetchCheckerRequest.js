const {
  client_update,
} = require("../../configuration/database/databaseUpdate.js");

exports.fetchCheckerRequest = async (req, res) => {
  try {
    const query = `
            SELECT *
            FROM app.change_tracker
            WHERE status = 'pending'
            ORDER BY created_at DESC;
        `;
    const result = await client_update.query(query);

    res.status(200).json({
      success: true,
      message: "Successfully fetched pending checker requests",
      data: result.rows,
    });
  } catch (error) {
    console.error("Error fetching pending checker requests:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch pending checker requests",
      error: error.message,
      stack: error.stack,
    });
  }
};
