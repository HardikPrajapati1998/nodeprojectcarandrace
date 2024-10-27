const Car = require("../models/Car");
const Driver = require("../models/Driver");

exports.getAllCars = (req, res) => {
  const { team_short_name } = req.params;
  Car.getAllCars(team_short_name, (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (!results.length)
      return res.status(404).json({ message: "No cars found for this team" });
    res.status(200).json(results);
  });
};

exports.getCarById = (req, res) => {
  const { id, team_short_name } = req.params;

  Car.getCarById(id, team_short_name, (err, car) => {
    if (err)
      return res
        .status(500)
        .json({ error: "An error occurred while fetching the car" });
    if (car.length === 0)
      return res.status(404).json({ message: "Car not found" });

    res.status(200).json(car);
  });
};

exports.createCar = (req, res) => {
  const { team_short_name } = req.params;
  const carData = req.body;

  Car.findTeamIdByShortName(team_short_name, (err, team_id) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (!team_id) return res.status(404).json({ message: "Team not found" });

    Car.addCar(carData, team_id, (err) => {
      if (err) return res.status(500).json({ error: "Failed to add car" });
      res.status(201).json({ message: "Car added successfully" });
    });
  });
};

exports.updateCar = (req, res) => {
  const { car_id } = req.params;
  const carData = req.body;

  Car.updateCar(car_id, carData, (err, result) => {
    if (err) return res.status(500).json({ error: "Failed to update car" });
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Car not found" });
    res.status(200).json({ message: "Car updated successfully" });
  });
};

exports.deleteCar = (req, res) => {
  const { car_id } = req.params;

  Car.deleteCar(car_id, (err, result) => {
    if (err) return res.status(500).json({ error: "Failed to delete car" });
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Car not found" });
    res.status(200).json({ message: "Car deleted successfully" });
  });
};

// Get the driver associated with a specific car by its id and team_short_name
exports.getCarDriver = (req, res) => {
  const { id, team_short_name } = req.params;

  Car.getCarDriver(id, team_short_name, (err, driver) => {
    if (err)
      return res
        .status(500)
        .json({ error: "An error occurred while fetching the driver" });
    if (!driver)
      return res.status(404).json({ message: "Driver not found for this car" });

    res.status(200).json(driver);
  });
};

// Update the driver associated with a specific car by its id and team_short_name
exports.updateCarDriver = (req, res) => {
  const { id, team_short_name } = req.params;
  const { driver_number } = req.body; // Expect driver_number to be provided in request body
  Driver.getDriverByNumber(team_short_name, driver_number, (err, driver) => {
    if (err)
      return res
        .status(500)
        .json({ error: "An error occurred while fetching the driver" });
    if (driver.length === 0)
      return res
        .status(404)
        .json({ message: "No drivers found for this team" });

    Car.updateCarDriver(id, team_short_name, driver_number, (err, result) => {
      if (err)
        return res
          .status(500)
          .json({ error: "An error occurred while updating the driver" });
      if (!result)
        return res.status(404).json({ message: "Car or driver not found" });

      res
        .status(200)
        .json({ message: "Driver updated successfully for the car" });
    });
  });
};

// Delete (remove) the driver associated with a specific car by its id and team_short_name
exports.deleteCarDriver = (req, res) => {
  const { id, team_short_name } = req.params;

  Car.deleteCarDriver(id, team_short_name, (err, result) => {
    if (err)
      return res
        .status(500)
        .json({ error: "An error occurred while removing the driver" });
    if (!result)
      return res
        .status(404)
        .json({ message: "Car not found or no driver associated" });

    res.status(200).json({ message: "Driver removed from the car" });
  });
};
// Function to generate a random number between min and max
const getRandom = (min, max) => Math.random() * (max - min) + min;

// Function to calculate lap time and check for crash
exports.getLapResult = (req, res) => {
  const { id, team_short_name } = req.params;
  const { trackType, baseLapTime } = req.query; // Expect trackType and baseLapTime in the query parameters

  // Check for required query params
  if (!trackType || !baseLapTime) {
    return res.status(400).json({
      error: "Missing required query parameters: trackType or baseLapTime",
    });
  }

  Car.getCarWithDriver(id, team_short_name, (err, car) => {
    if (err) {
      return res
        .status(500)
        .json({ error: "An error occurred while fetching the car" });
    }

    // If the car does not exist
    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }

    // Return 418 if the car has no associated driver
    if (!car.driver_number) {
      return res.status(418).json({
        message: "This car has no driver!",
      });
    }

    const {
      suitability_race,
      suitability_street,
      reliability,
      skill_race,
      skill_street,
    } = car;

    // Step 1: Determine if the car crashes
    const crashChance =
      trackType === "street"
        ? getRandom(0, reliability + 10)
        : getRandom(0, reliability + 5);
    const crashed = crashChance > reliability;

    if (crashed) {
      return res.status(200).json({
        time: 0,
        randomness: 0,
        crashed: true,
      });
    }

    // Step 2: Calculate car speed based on track type
    const suitability =
      trackType === "street" ? suitability_street : suitability_race;
    const driverSkill = trackType === "street" ? skill_street : skill_race;
    const speed = (suitability + driverSkill + (100 - reliability)) / 3;

    // Step 3: Calculate lap time
    const lapTime = parseFloat(baseLapTime) + (10 * speed) / 100;

    // Step 4: Add randomness
    const randomness = getRandom(0, 5);
    const finalLapTime = lapTime + randomness;

    // Step 5: Return the result
    res.status(200).json({
      time: finalLapTime.toFixed(3),
      randomness: randomness.toFixed(3),
      crashed: false,
    });
  });
};
