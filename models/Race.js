// models/raceModel.js
const db = require("../config/db");
const Race = {
  // Get all races for a specific team or track
  getAllRaces: (callback) => {
    const sql = `SELECT races.id, races.track_id, tracks.name AS track_name, races.entrants, races.starting_positions, races.laps 
               FROM races 
               JOIN tracks ON races.track_id = tracks.id`;
    db.query(sql, [], (err, results) => {
      if (err) return callback(err, null);
      callback(null, results);
    });
  },

  // Get all races for a specific track
  getRacesByTrack: (trackId, callback) => {
    const sql = `SELECT races.id, races.track_id, tracks.name AS track_name, races.entrants, races.starting_positions, races.laps 
               FROM races 
               JOIN tracks ON races.track_id = tracks.id 
               WHERE track_id = ?`;
    db.query(sql, [trackId], (err, results) => {
      if (err) return callback(err, null);
      callback(null, results);
    });
  },

  // Create a new race with a specific track ID
  createRace: (trackId, callback) => {
    const sql = `INSERT INTO races (track_id, entrants, starting_positions, laps) VALUES (?, '[]', '[]', '[]')`;
    db.query(sql, [trackId], (err, result) => {
      if (err) return callback(err, null);
      callback(null, result.insertId); // Returns the new race ID
    });
  },

  // Get race by ID
  getRaceById: (raceId, callback) => {
    const sql = `SELECT races.id, races.track_id, tracks.name AS track_name, races.entrants, races.starting_positions, races.laps
                 FROM races
                 JOIN tracks ON races.track_id = tracks.id
                 WHERE races.id = ?`;

    db.query(sql, [raceId], (err, results) => {
      if (err) return callback(err, null);
      if (results.length === 0)
        return callback(new Error("Race not found"), null);

      // Format the race data
      const race = results[0];
      const formattedRace = {
        id: race.id,
        track: {
          name: race.track_name,
          uri: `${process.env.APP_URL_TEAMS_API}/track/${race.track_id}`,
        },
        entrants: JSON.parse(race.entrants || "[]"),
        startingPositions: JSON.parse(race.starting_positions || "[]"),
        laps: JSON.parse(race.laps || "[]"),
      };
      callback(null, formattedRace);
    });
  },
  getEntrantsByRaceId: (raceId, callback) => {
    const sql = `SELECT entrants FROM races WHERE id = ?`;

    db.query(sql, [raceId], (err, results) => {
      if (err) return callback(err, null);
      if (results.length === 0)
        return callback(new Error("Race not found"), null);

      const race = results[0];
      const entrants = JSON.parse(race.entrants || "[]");
      callback(null, entrants);
    });
  },

  // Add entrant to race
  addEntrantToRace: (raceId, newEntrant, callback) => {
    const sql = `SELECT entrants, starting_positions FROM races WHERE id = ?`;

    db.query(sql, [raceId], (err, results) => {
      if (err) return callback(err, null);
      if (results.length === 0)
        return callback(new Error("Race not found"), null);

      const race = results[0];
      const entrants = JSON.parse(race.entrants || "[]");
      const startingPositions = JSON.parse(race.starting_positions || "[]");

      // Check if qualifying has already taken place
      if (startingPositions.length > 0) {
        return callback(new Error("Qualifying has already taken place"), null);
      }

      // Check if the entrant already exists
      if (entrants.includes(newEntrant.uri)) {
        return callback(new Error("Entrant already exists"), null);
      }

      // Check if any driver with the same number already exists
      const driverNumbers = entrants.map((entrant) => entrant.driver.number);
      if (driverNumbers.includes(newEntrant.driver.number)) {
        return callback(new Error("Driver number already exists"), null);
      }

      // Validate that the car's suitability and skill values sum to 100
      const { suitability, skill } = newEntrant.driver;
      if (suitability + skill !== 100) {
        return callback(
          new Error("Suitability and skill values must sum to 100"),
          null
        );
      }

      // If validation passed, add the new entrant to the entrants array
      entrants.push(newEntrant);

      const updateSql = `UPDATE races SET entrants = ? WHERE id = ?`;
      db.query(updateSql, [JSON.stringify(entrants), raceId], (err) => {
        if (err) return callback(err, null);
        callback(null, entrants);
      });
    });
  },

  findTeamIdByShortName: (team_short_name, callback) => {
    const sql = "SELECT id FROM teams WHERE short_name = ?";
    db.query(sql, [team_short_name], (err, results) => {
      if (err) return callback(err);
      callback(null, results.length ? results[0].id : null);
    });
  },

  // Assign starting positions based on driver's skill
  assignStartingPositions: (raceId, callback) => {
    const sql = `SELECT entrants, starting_positions FROM races WHERE id = ?`;

    db.query(sql, [raceId], (err, results) => {
      if (err) return callback(err, null);
      if (results.length === 0)
        return callback(new Error("Race not found"), null);

      const race = results[0];
      const entrants = JSON.parse(race.entrants || "[]");
      const startingPositions = JSON.parse(race.starting_positions || "[]");

      // Check if there are no entrants
      if (entrants.length === 0) {
        return callback(new Error("No entrants in the race"), null);
      }

      // Check if starting positions have already been assigned
      if (startingPositions.length > 0) {
        return callback(
          new Error("Starting positions have already been populated"),
          null
        );
      }

      // Sort entrants by driver's skill in descending order
      entrants.sort((a, b) => b.driver.skill - a.driver.skill);

      // Assign unique starting positions based on skill
      const positions = entrants.map((entrant, index) => index); // 0 for pole, 1 for second, etc.

      const updateSql = `UPDATE races SET starting_positions = ? WHERE id = ?`;
      db.query(updateSql, [JSON.stringify(positions), raceId], (err) => {
        if (err) return callback(err, null);
        callback(null, positions);
      });
    });
  },

  removeEntrant: (raceId, carUri, callback) => {
    const sql = `SELECT entrants FROM races WHERE id = ?`;

    db.query(sql, [raceId], (err, results) => {
      if (err) return callback(err, null);
      if (results.length === 0)
        return callback(new Error("Race not found"), null);

      const race = results[0];
      const entrants = JSON.parse(race.entrants || "[]");

      // Check if the car URI exists in the entrants array
      const entrantIndex = entrants.findIndex(
        (entrant) => entrant.uri === carUri
      );
      console.log(entrantIndex);
      if (entrantIndex === -1) {
        return callback(new Error("Car URI not found in race entrants"), null);
      }

      // Remove the car URI from the entrants array
      entrants.splice(entrantIndex, 1);

      const updateSql = `UPDATE races SET entrants = ? WHERE id = ?`;
      db.query(updateSql, [JSON.stringify(entrants), raceId], (err) => {
        if (err) return callback(err, null);
        callback(null, entrants);
      });
    });
  },
  getRaceLaps: (raceId, callback) => {
    const sql = `SELECT track_id, laps 
                     FROM races 
                     WHERE id = ?`;
    db.query(sql, [raceId], (err, results) => {
      if (err) return callback(err, null);
      callback(null, results);
    });
  },

  getRaceLeaderboardForLap: (raceId, lapNumber, callback) => {
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

      if (lapNumber > parsedLaps.length) {
        return callback(
          new Error("Lap number exceeds total laps recorded"),
          null
        );
      }

      // Build leaderboard data
      const leaderboard = parsedEntrants.map((entrant, index) => {
        return {
          uri: entrant,
          laps: 0,
          time: parsedStartingPositions[index] * 5,
          crashed: false,
          shortName: 'test',
        };
      });

      for (let i = 0; i < lapNumber; i++) {
        const lap = parsedLaps[i];
        if (!lap || !lap.lapTimes) continue;

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
      }

      // Sort leaderboard based on laps and then time
      leaderboard.sort((a, b) => {
        if (b.laps === a.laps) return a.time - b.time;
        return b.laps - a.laps;
      });

      callback(null, leaderboard);
    });
  },
  getRaceLeaderboard:(raceId, callback) => {
    const sql = `SELECT entrants, starting_positions, laps 
                 FROM races 
                 WHERE id = ?`;
    
    db.query(sql, [raceId], (err, results) => {
        if (err) return callback(err, null);
        if (results.length === 0) return callback(new Error('Race not found'), null);
        
        const { entrants, starting_positions, laps } = results[0];
        const parsedEntrants = JSON.parse(entrants || '[]');
        const parsedStartingPositions = JSON.parse(starting_positions || '[]');
        const parsedLaps = JSON.parse(laps || '[]');
        
        const latestLap = parsedLaps.length;  // Total number of laps recorded so far

        // If no laps are recorded, return an empty leaderboard
        if (latestLap === 0) {
            return callback(null, {
                lap: latestLap,
                entrants: []
            });
        }

        // Initialize leaderboard with entrant data, starting positions, and base times
        const leaderboard = parsedEntrants.map((entrant, index) => {
            return {
                uri: entrant,
                laps: 0,
                time: parsedStartingPositions[index] * 5,
                crashed: false
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
                        entry.time += parseFloat(lapTime.time) + parseFloat(lapTime.randomness || 0);
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
}
};

module.exports = Race;
