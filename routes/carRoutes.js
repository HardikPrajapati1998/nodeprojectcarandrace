const express = require("express");
const router = express.Router();
const carController = require("../controllers/carController");

// Route to get all cars for a specific team
router.get("/:team_short_name/cars", carController.getAllCars);

// Add the new route to get a car by its id and team short name
router.get("/:team_short_name/car/:id", carController.getCarById);

// Route to add a new car
router.post("/:team_short_name/car", carController.createCar);

// Route to update a car by its ID
router.put("/:team_short_name/car/:car_id", carController.updateCar);

// Route to delete a car by its ID
router.delete("/:team_short_name/car/:car_id", carController.deleteCar);

// Get driver associated with a specific car
router.get("/:team_short_name/car/:id/driver", carController.getCarDriver);

// Update driver associated with a specific car
router.put("/:team_short_name/car/:id/driver", carController.updateCarDriver);

// Delete driver association from a specific car
router.delete(
  "/:team_short_name/car/:id/driver",
  carController.deleteCarDriver
);

// Get lap results for a specific car
router.get("/:team_short_name/car/:id/lap", carController.getLapResult);

module.exports = router;
