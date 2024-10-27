const db = require("../config/db");

const Car = {
  getAllCars: (team_short_name, callback) => {
    const sql = `
    SELECT cars.id, cars.reliability, cars.suitability_race AS suitabilityRace, cars.suitability_street AS suitabilityStreet,
           drivers.name AS driverName, drivers.number AS driverNumber
    FROM cars
    JOIN teams ON cars.team_id = teams.id
    LEFT JOIN drivers ON cars.driver_number = drivers.number
    WHERE teams.short_name = ?
  `;

    db.query(sql, [team_short_name], (err, results) => {
      if (err) return callback(err);

      // Map results to the desired format
      const formattedResults = results.map((car) => ({
        id: car.id.toString(), // Convert ID to string as per your requirement
        driver: car.driverName
          ? {
              // Use a ternary operator to conditionally include the driver object
              name: car.driverName,
              uri: `${process.env.APP_URL_TEAMS_API}${team_short_name}/driver/${car.driverNumber}`,
            }
          : null, // Set to null if driverName does not exist
        suitability: {
          street: car.suitabilityStreet,
          race: car.suitabilityRace,
        },
        reliability: car.reliability,
      }));

      // Return the formatted results
      callback(null, formattedResults);
    });
  },

  getCarById: (id, team_short_name, callback) => {
    const sql = `
    SELECT cars.id, cars.reliability, cars.suitability_race AS suitabilityRace, cars.suitability_street AS suitabilityStreet,
           drivers.name AS driverName, drivers.number AS driverNumber
    FROM cars
    JOIN teams ON cars.team_id = teams.id
    JOIN drivers ON cars.driver_number = drivers.number
    WHERE teams.short_name = ? AND cars.id = ?
  `;

    db.query(sql, [team_short_name, id], (err, results) => {
      if (err) return callback(err);

      // Map results to the desired format
      const formattedResults = results.map((car) => ({
        id: car.id.toString(), // Convert ID to string as per your requirement
        driver: {
          name: car.driverName,
          uri: `${process.env.APP_URL_TEAMS_API}${team_short_name}/driver/${car.driverNumber}`,
        },
        suitability: {
          street: car.suitabilityStreet,
          race: car.suitabilityRace,
        },
        reliability: car.reliability,
      }));

      // Return the formatted results
      callback(null, formattedResults);
    });
  },

  addCar: (carData, team_id, callback) => {
    const sql = `
      INSERT INTO cars (driver_number, suitability_race, suitability_street, reliability, team_id)
      VALUES (?, ?, ?, ?, ?)
    `;
    db.query(
      sql,
      [
        carData.driver_number,
        carData.suitability_race,
        carData.suitability_street,
        carData.reliability,
        team_id,
      ],
      (err) => {
        if (err) return callback(err);
        callback(null);
      }
    );
  },

  updateCar: (car_id, carData, callback) => {
    const sql = `
      UPDATE cars
      SET suitability_race = ?, suitability_street = ?, reliability = ?
      WHERE id = ?
    `;
    db.query(
      sql,
      [
        carData.suitability_race,
        carData.suitability_street,
        carData.reliability,
        car_id,
      ],
      (err, result) => {
        if (err) return callback(err);
        callback(null, result);
      }
    );
  },

  deleteCar: (car_id, callback) => {
    const sql = "DELETE FROM cars WHERE id = ?";
    db.query(sql, [car_id], (err, result) => {
      if (err) return callback(err);
      callback(null, result);
    });
  },

  // Get the driver associated with a specific car by car id and team_short_name
  getCarDriver: (id, team_short_name, callback) => {
    const query = `
    SELECT drivers.* 
    FROM cars 
    JOIN drivers ON cars.driver_number = drivers.number 
    JOIN teams ON cars.team_id = teams.id 
    WHERE cars.id = ? AND teams.short_name = ?`;

    db.query(query, [id, team_short_name], (err, result) => {
      if (err) return callback(err, null);
      if (result.length === 0) return callback(null, null);
      // Map results to the desired format
      const formattedResults = result.map((driver) => ({
        number: driver.number,
        shortName: driver.short_name,
        name: driver.name,
        skill: {
          race: driver.skill_race,
          street: driver.skill_street,
        },
      }));

      callback(null, formattedResults); // Return the first matching driver
    });
  },

  // Update the driver associated with a specific car by car id and team_short_name
  updateCarDriver: (id, team_short_name, driver_number, callback) => {
    const query = `
    UPDATE cars 
    JOIN teams ON cars.team_id = teams.id 
    SET cars.driver_number = ? 
    WHERE cars.id = ? AND teams.short_name = ?`;

    db.query(query, [driver_number, id, team_short_name], (err, result) => {
      if (err) return callback(err, null);
      if (result.affectedRows === 0) return callback(null, null);

      callback(null, result);
    });
  },

  // Delete (remove) the driver association for a car by car id and team_short_name
  deleteCarDriver: (id, team_short_name, callback) => {
    const query = `
    UPDATE cars 
    JOIN teams ON cars.team_id = teams.id 
    SET cars.driver_number = NULL 
    WHERE cars.id = ? AND teams.short_name = ?`;

    db.query(query, [id, team_short_name], (err, result) => {
      if (err) return callback(err, null);
      if (result.affectedRows === 0) return callback(null, null);

      callback(null, result);
    });
  },

  getCarWithDriver: (id, team_short_name, callback) => {
    const query = `
    SELECT cars.*, drivers.*, teams.short_name 
    FROM cars 
    LEFT JOIN drivers ON cars.driver_number = drivers.number 
    JOIN teams ON cars.team_id = teams.id 
    WHERE cars.id = ? AND teams.short_name = ?`;

    db.query(query, [id, team_short_name], (err, result) => {
      if (err) return callback(err, null);
      if (result.length === 0) return callback(null, null);

      const car = result[0]; // Assuming one car per id
      callback(null, car);
    });
  },

  findTeamIdByShortName: (team_short_name, callback) => {
    const sql = "SELECT id FROM teams WHERE short_name = ?";
    db.query(sql, [team_short_name], (err, results) => {
      if (err) return callback(err);
      callback(null, results.length ? results[0].id : null);
    });
  },

  getRaceLeaderboard:(raceId, callback) => {
    const sql = `SELECT entrants, starting_positions, laps 
                 FROM races 
                 WHERE id = ?`;

    db.query(sql, [raceId], (err, results) => {
      if (err) return callback(err, null);
      if (results.length === 0)
        return callback(new Error("Race not found"), null);

      const { entrants, starting_positions, laps } = results[0];
      const parsedEntrants = JSON.parse(entrants || "[]");
      const parsedStartingPositions = JSON.parse(starting_positions || "[]");
      const parsedLaps = JSON.parse(laps || "[]");

      const latestLap = parsedLaps.length; // Total number of laps recorded so far

      // If no laps are recorded, return an empty leaderboard
      if (latestLap === 0) {
        return callback(null, {
          lap: latestLap,
          entrants: [],
        });
      }

      // Initialize leaderboard with entrant data, starting positions, and base times
      const leaderboard = parsedEntrants.map((entrant, index) => {
        return {
          uri: entrant,
          laps: 0,
          time: parsedStartingPositions[index] * 5,
          crashed: false,
        };
      });

      // Process each lap up to the most recent one
      parsedLaps.forEach((lap, lapIndex) => {
        if (!lap || !lap.lapTimes) return;

        lap.lapTimes.forEach((lapTime, idx) => {
          const entry = leaderboard[idx];
          if (!entry.crashed) {
            if (lapTime.crashed) {
              entry.crashed = true;
            } else {
              entry.laps += 1;
              entry.time +=
                parseFloat(lapTime.time) + parseFloat(lapTime.randomness || 0);
            }
          }
        });
      });

      // Sort leaderboard based on laps completed and total time
      leaderboard.sort((a, b) => {
        if (b.laps === a.laps) return a.time - b.time;
        return b.laps - a.laps;
      });

      callback(null, { lap: latestLap, entrants: leaderboard });
    });
  },
};

module.exports = Car;
