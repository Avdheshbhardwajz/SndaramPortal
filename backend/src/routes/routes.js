const express = require("express");
const router = express.Router();
const { verifyToken, authorize } = require('../middleware/auth.js');

// Import controllers
const {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
 
} = require("../controllers/users/users.js");
const {
  fetchChangeTrackerData,
} = require("../controllers/changeTrackerData/fetchChangeTrackerData.js");
const { requestData } = require("../controllers/requestData/requestData.js");
const { table } = require("../controllers/table/table.js");
const { approve } = require("../controllers/approve/approve.js");
const { reject } = require("../controllers/reject/reject.js");
const { tableData } = require("../controllers/tableData/tableData.js");
const {
  ColumnPermission,
} = require("../controllers/ColumnPermission/ColumnPermission.js");
const { fetchColumn } = require("../controllers/fetchColumn/fetchColumn.js");
const {
  fetchColumnDropDown,
} = require("../controllers/fetchColumnDropdown/fetchColumnDropdown.js");
const {
  updateColumnDropDown,
} = require("../controllers/updateColumnDropdown/updateColumnDropdown.js");
const {
  fetchColumnStatus,
} = require("../controllers/fetchColumnStatus/fetchColumnStatus.js");
const {
  fetchDropdownOptions,
} = require("../controllers/fetchDropdownOptions/fetchDropdownOptions.js");
const { addGroup } = require("../controllers/tablesGroup/tableGroup.js");
const { addTable } = require("../controllers/tablesGroup/tableGroup.js");
const { getGroupList } = require("../controllers/getGroupList/getGroupList.js");
const { removeGroup } = require("../controllers/removeGroup/removeGroup.js");
const { removeTable } = require("../controllers/removeTable/removeTable.js");
const { getAllCheckerRequest } = require('../controllers/getAllCheckerRequest/getAllCheckerRequest.js');
const { allApprove } = require('../controllers/approveAll/allApprove.js');
const { allReject } = require('../controllers/allReject/allReject.js');
const { addRow } = require('../controllers/addRow/addRow.js');
const { fetchRowRequest } = require('../controllers/fetchRowRequest/fetchRowRequest.js');
const { acceptRow } = require('../controllers/acceptRow/acceptRow.js');
const { rejectRow } = require('../controllers/rejectRow/rejectRow.js');
const { rejectAllRow } = require('../controllers/rejectAllRow/rejectAllRow.js');
const { acceptAllRow } = require('../controllers/approveAllRow/acceptAllRow.js');
const { isActive } = require('../controllers/isActive/isActive.js');
const { highlightCells } = require('../controllers/cellsHighlight/cellsHighlight.js');
const { getMakerNotification } = require('../controllers/makerNotification/makerNotification.js');
const { getCheckerNotification } = require('../controllers/checkerNotification/checkerNotification.js');
const { getAdminNotification } = require('../controllers/adminNotification/adminNotification.js');
const { sendOTP } = require('../controllers/sendOTP/sendOTP.js');
const { verifyOTP } = require('../controllers/verifyOTP/verifyOTP.js');



// Public routes

router.post("/signup",verifyToken, authorize('admin'), createUser);

//opt auth endpoints 
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);

// User management routes - Admin only
router.get("/users", verifyToken,  getAllUsers);
router.get("/users/:id", verifyToken,  getUserById);
router.put("/users/:id", verifyToken, authorize('admin'), updateUser);
router.post('/isactive', verifyToken, authorize('admin'), isActive);

// Data routes - Authenticated users
router.get("/fetchchangetrackerdata", verifyToken, fetchChangeTrackerData);
router.post("/requestdata", verifyToken, requestData);
router.get("/table", verifyToken, table);
router.get("/tableData/:name", verifyToken, tableData);

// Request management routes - Checker role
router.post("/approve", verifyToken, authorize('checker'), approve);
router.post("/reject", verifyToken, authorize('checker'), reject);

//column configuration routes
router.post("/columnPermission", verifyToken,  ColumnPermission);
router.post("/fetchcolumn", verifyToken, fetchColumn);

//dropdown configuratuon routes
router.post("/fetchColumnDropDown", verifyToken, fetchColumnDropDown);
router.post("/updateColumnDropDown", verifyToken,  updateColumnDropDown);
router.post("/fetchColumnStatus", verifyToken,  fetchColumnStatus);
router.post("/fetchDropdownOptions", verifyToken, fetchDropdownOptions);

// group configuration routes
router.post("/addgroup", verifyToken, authorize('admin'), addGroup); //create group
router.post("/addtable", verifyToken, authorize('admin'), addTable); // add table inside of a group
router.get("/getgrouplist", verifyToken,  getGroupList); //show all group and table list respectively
router.post("/removegroup", verifyToken, authorize('admin'), removeGroup);
router.post("/removetable", verifyToken, authorize('admin'), removeTable);

//checker logs 
router.post('/getallcheckerrequest', verifyToken, authorize('checker', 'admin'), getAllCheckerRequest);
router.post('/approveall', verifyToken, authorize('checker'), allApprove);
router.post('/rejectall', verifyToken, authorize('checker'), allReject);

//endpoint to handle add of rows 
router.post('/addrow', verifyToken, addRow);
router.get('/fetchrowrequest', verifyToken, fetchRowRequest);
router.post('/acceptrow', verifyToken, acceptRow);
router.post('/rejectrow', verifyToken, rejectRow);
router.post('/rejectallrow', verifyToken,  rejectAllRow);
router.post('/acceptallrow', verifyToken, acceptAllRow);

// Notification routes
router.get("/maker-notification", verifyToken, authorize('maker'), getMakerNotification);
router.get("/checker-notification", verifyToken, authorize('checker'), getCheckerNotification);
router.get("/admin-notification", verifyToken, authorize('admin'), getAdminNotification);

// Cell highlighting endpoint
router.post('/highlight-cells', verifyToken, highlightCells);

module.exports = router;
