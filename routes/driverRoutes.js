const express = require("express");
const router = express.Router();
const driverController = require("../controllers/driverController");

// Route to get all drivers for a specific team
router.get("/:team_short_name/drivers", driverController.getAllDrivers);

// Add the new route to get a driver by their number
router.get(
  "/:team_short_name/drivers/:number",
  driverController.getDriverByNumber
);

// Route to add a new driver
router.post("/:team_short_name/drivers", driverController.createDriver);

// Route to update a driver by their number
router.put(
  "/:team_short_name/drivers/:driver_number",
  driverController.updateDriver
);

// Route to delete a driver by their number
router.delete(
  "/:team_short_name/drivers/:driver_number",
  driverController.deleteDriver
);

module.exports = router;
