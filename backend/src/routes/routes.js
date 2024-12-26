const express = require("express");
const router = express.Router();

// Import controllers
const {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  signin,
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


// Authentication routes
router.post("/signin", signin);
router.post("/signup", createUser);

// User management routes
router.get("/users", getAllUsers);
router.get("/users/:id", getUserById);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

// Data routes
router.get("/fetchchangetrackerdata", fetchChangeTrackerData);
router.post("/requestdata", requestData);
router.get("/table", table);
router.get("/tableData/:name", tableData);

// Request management routes
router.post("/approve", approve);
router.post("/reject", reject);

//column configuration routes
router.post("/columnPermission", ColumnPermission);
router.post("/fetchcolumn", fetchColumn);

//dropdown configuratuon routes
router.post("/fetchColumnDropDown", fetchColumnDropDown);
router.post("/updateColumnDropDown", updateColumnDropDown);
router.post("/fetchColumnStatus", fetchColumnStatus);
router.post("/fetchDropdownOptions", fetchDropdownOptions);

// group configuration routes
router.post("/addgroup", addGroup); //create group
router.post("/addtable", addTable); // add table inside of a group
router.get("/getgrouplist", getGroupList); //show all group and table list respectively
router.post("/removegroup", removeGroup);
router.post("/removetable", removeTable);

//checker logs 
router.post('/getallcheckerrequest', getAllCheckerRequest);

//endpoint to manage bulk requst 
router.post('/approveall', allApprove);
router.post('/rejectall', allReject);

module.exports = router;
