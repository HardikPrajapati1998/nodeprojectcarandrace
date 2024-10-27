// controllers/raceController.js
const Race = require("../models/Race");
const db = require("../config/db");
const Track = require("../models/Track");
const axios = require("axios");

// Get all races
exports.getAllRaces = (req, res) => {
  const teamShortName = req.params.team_short_name;
  Race.findTeamIdByShortName(teamShortName, (err, team_id) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (!team_id) return res.status(404).json({ message: "Team not found" });
    Race.getAllRaces((err, races) => {
      if (err) return res.status(500).json({ error: "Database error" });

      // Format races
      const formattedRaces = races.map((race) => ({
        track: {
          name: race.track_name,
          uri: `https://your-api-domain/track/${race.track_id}`,
        },
        id: race.id,
        entrants: JSON.parse(race.entrants || "[]"),
        startingPositions: JSON.parse(race.starting_positions || "[]"),
        laps: JSON.parse(race.laps || "[]"),
      }));

      res.json({
        code: 200,
        result: formattedRaces,
      });
    });
  });
};

// Create a new race with a given track
exports.createRace = (req, res) => {
  const teamShortName = req.params.team_short_name;
  Race.findTeamIdByShortName(teamShortName, (err, team_id) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (!team_id) return res.status(404).json({ message: "Team not found" });
    const { track_id } = req.body;

    if (!track_id) {
      return res.status(400).json({ error: "Track ID is required" });
    }

    Race.createRace(track_id, (err, raceId) => {
      if (err) return res.status(500).json({ error: "Failed to create race" });

      res.json({
        code: 200,
        message: `New race created with ID ${raceId}`,
      });
    });
  });
};

// Get race by ID
exports.getRaceById = (req, res) => {
  const raceId = req.params.id;
  const teamShortName = req.params.team_short_name;
  Race.findTeamIdByShortName(teamShortName, (err, team_id) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (!team_id) return res.status(404).json({ message: "Team not found" });
    Race.getRaceById(raceId, (err, race) => {
      if (err) {
        if (err.message === "Race not found") {
          return res.status(404).json({ code: 404, message: "Race not found" });
        }
        return res.status(500).json({ code: 500, message: "Database error" });
      }

      res.json({
        code: 200,
        result: race,
      });
    });
  });
};

// Get entrants by race ID
exports.getEntrantsByRaceId = (req, res) => {
  const raceId = req.params.id;
  const teamShortName = req.params.team_short_name;
  Race.findTeamIdByShortName(teamShortName, (err, team_id) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (!team_id) return res.status(404).json({ message: "Team not found" });
    Race.getEntrantsByRaceId(raceId, (err, entrants) => {
      if (err) {
        if (err.message === "Race not found") {
          return res.status(404).json({ code: 404, message: "Race not found" });
        }
        return res.status(500).json({ code: 500, message: "Database error" });
      }

      res.json({
        code: 200,
        result: entrants,
      });
    });
  });
};

// Add entrant to race
exports.addEntrantToRace = (req, res) => {
  const raceId = req.params.id;
  const newEntrant = req.body;
  const teamShortName = req.params.team_short_name;
  Race.findTeamIdByShortName(teamShortName, (err, team_id) => {
    console.log(err);
    if (err) return res.status(500).json({ error: "Database error" });
    if (!team_id) return res.status(404).json({ message: "Team not found" });
    // Ensure that the body contains all required fields
    if (
      !newEntrant.uri
    ) {
      return res
        .status(400)
        .json({ code: 400, message: "Invalid entrant data" });
    }

    Race.addEntrantToRace(raceId, newEntrant, (err, entrants) => {
      if (err) {
        console.log(err);
        if (err.message === "Race not found") {
          return res.status(404).json({ code: 404, message: "Race not found" });
        }
        if (err.message === "Entrant already exists") {
          return res
            .status(400)
            .json({ code: 400, message: "Entrant already exists" });
        }
        if (err.message === "Driver number already exists") {
          return res
            .status(400)
            .json({ code: 400, message: "Driver number already exists" });
        }
        if (err.message === "Suitability and skill values must sum to 100") {
          return res.status(400).json({
            code: 400,
            message: "Suitability and skill values must sum to 100",
          });
        }
        if (err.message === "Qualifying has already taken place") {
          return res
            .status(400)
            .json({ code: 400, message: "Qualifying has already taken place" });
        }
        return res.status(500).json({ code: 500, message: "Database error" });
      }

      res.status(200).json({
        code: 200,
        message: "Entrant added successfully",
        result: entrants,
      });
    });
  });
};

exports.qualifyRace = (req, res) => {
  const raceId = req.params.id;
  const teamShortName = req.params.team_short_name;
  Race.findTeamIdByShortName(teamShortName, (err, team_id) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (!team_id) return res.status(404).json({ message: "Team not found" });
    Race.assignStartingPositions(raceId, (err, positions) => {
      if (err) {
        console.log(err);
        if (err.message === "Race not found") {
          return res.status(404).json({ code: 404, message: "Race not found" });
        }
        if (err.message === "No entrants in the race") {
          return res
            .status(400)
            .json({ code: 400, message: "No entrants in the race" });
        }
        if (err.message === "Starting positions have already been populated") {
          return res.status(400).json({
            code: 400,
            message: "Starting positions have already been populated",
          });
        }
        return res.status(500).json({ code: 500, message: "Database error" });
      }

      res.status(200).json({
        code: 200,
        message: "Starting positions assigned successfully",
        result: positions,
      });
    });
  });
};

// Remove car entrant from the race
exports.removeEntrant = (req, res) => {
  const raceId = req.params.id;
  const carUri = req.body.carUri; // Car URI provided in the request body
  const teamShortName = req.params.team_short_name;
  Race.findTeamIdByShortName(teamShortName, (err, team_id) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (!team_id) return res.status(404).json({ message: "Team not found" });
    if (!carUri) {
      return res
        .status(400)
        .json({ code: 400, message: "Car URI is required" });
    }

    Race.removeEntrant(raceId, carUri, (err, updatedEntrants) => {
      if (err) {
        if (err.message === "Race not found") {
          return res.status(404).json({ code: 404, message: "Race not found" });
        }
        if (err.message === "Car URI not found in race entrants") {
          return res
            .status(404)
            .json({ code: 404, message: "Car URI not found in race entrants" });
        }
        return res.status(500).json({ code: 500, message: "Database error" });
      }

      res.status(200).json({
        code: 200,
        message: "Car entrant removed successfully",
        result: updatedEntrants,
      });
    });
  });
};

// Get laps for a specific race by ID
exports.getRaceLaps = (req, res) => {
  const raceId = parseInt(req.params.id);
  const teamShortName = req.params.team_short_name;
  Race.findTeamIdByShortName(teamShortName, (err, team_id) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (!team_id) return res.status(404).json({ message: "Team not found" });

    Race.getRaceLaps(raceId, (err, results) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Error retrieving race data", error: err });
      }

      // If no results, return a 404
      if (results.length === 0) {
        return res.status(404).json({ message: "Race not found" });
      }

      const raceData = results[0];

      // Extract laps data from the JSON column
      const laps = raceData.laps ? JSON.parse(raceData.laps) : [];

      // Build the response with lap details
      const response = {
        code: 200,
        track: {
          id: raceData.track_id,
          uri: `${process.env.APP_URL_TIMING_API}${teamShortName}/track/${raceData.track_id}`,
        },
        laps: laps.map((lap) => ({
          number: lap.number,
          lapTimes: lap.lapTimes.map((lt) => ({
            entrant: lt.entrant,
            time: lt.time,
            crashed: lt.crashed,
          })),
        })),
      };

      // Send the response
      res.status(200).json(response);
    });
  });
};

// Modify getTrackById to return a Promise
async function getTrackById(id, team_short_name) {
  return new Promise((resolve, reject) => {
    Track.getTrackById(id, team_short_name, (err, track) => {
      if (err)
        return reject({
          status: 500,
          message: "Error retrieving track data",
          error: err,
        });
      if (!track) return reject({ status: 404, message: "Track not found" });
      resolve(track);
    });
  });
}

// POST /race/:id/lap - Add a new lap to the race
exports.addRaceLap = async (req, res) => {
  const raceId = parseInt(req.params.id);
  const team_short_name = req.params.team_short_name;

  // Query to get race details, including entrants, starting positions, and laps
  const raceQuery = `SELECT entrants, starting_positions, laps, track_id FROM races WHERE id = ?`;

  db.query(raceQuery, [raceId], async (err, results) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Error retrieving race data", error: err });
    }

    // If no race found, return 404
    if (results.length === 0) {
      return res.status(404).json({ message: "Race not found" });
    }

    const raceData = results[0];
    const { entrants, starting_positions, laps, track_id } = raceData;

    // Parse JSON fields from the database
    const parsedEntrants = entrants ? JSON.parse(entrants) : [];
    const parsedStartingPositions = starting_positions
      ? JSON.parse(starting_positions)
      : [];
    const parsedLaps = laps ? JSON.parse(laps) : [];

    // Validate if entrants or starting positions are missing
    if (parsedEntrants.length === 0) {
      return res.status(400).json({ message: "No entrants in this race" });
    }
    if (parsedStartingPositions.length === 0) {
      return res
        .status(400)
        .json({ message: "Starting positions have not been populated yet" });
    }

    // Determine the current lap number
    const currentLapNumber = parsedLaps.length ? parsedLaps.length + 1 : 1;

    const newLap = {
      number: currentLapNumber,
      lapTimes: [],
    };

    try {
      // Fetch the track details
      const track = await getTrackById(track_id, team_short_name);
      console.log(track);

      // Simulate laps for each entrant that has not crashed
      for (const entrant of parsedEntrants) {
        console.log(entrant?.uri);
        console.log(`${entrant?.uri}/lap`);
        // Make a request to the external service for lap time data
        const lapResponse = await axios.get(`${entrant?.uri}/lap`, {
          params: {
            trackType: track["type"],
            baseLapTime: track["baseLapTime"],
          },
        });

        const lapData = lapResponse.data;
        const { time, randomness, crashed } = lapData;

        // If the car has crashed, skip recording further laps for this entrant
        const lapTime = crashed ? 0 : time + randomness;

        // Add lap data to the newLap object
        newLap.lapTimes.push({
          entrant: parsedLaps.length,
          time: lapTime,
          crashed: crashed,
        });
      }
    } catch (err) {
      // If there is an issue with the external service or track retrieval, handle it
      return res
        .status(err.status || 500)
        .json({ message: err.message, error: err.error });
    }

    // Add the new lap to the laps array
    parsedLaps.push(newLap);

    // Update the race in the database with the new laps array
    const updateQuery = `UPDATE races SET laps = ? WHERE id = ?`;
    db.query(updateQuery, [JSON.stringify(parsedLaps), raceId], (updateErr) => {
      if (updateErr) {
        return res
          .status(500)
          .json({ message: "Error updating race data", error: updateErr });
      }

      res
        .status(200)
        .json({ message: "Lap added successfully", laps: parsedLaps });
    });
  });
};

// GET /race/:id/lap/:number - Get leaderboard for specified lap
exports.getRaceLapLeaderboard = (req, res) => {
  const raceId = parseInt(req.params.id);
  const lapNumber = parseInt(req.params.number);

  Race.getRaceLeaderboardForLap(raceId, lapNumber, (err, leaderboard) => {
      if (err) {
          return res.status(400).json({ message: err.message });
      }

      // Mocked driver info for each entrant (replace this with actual driver details from the car URIs in a real scenario)
      const enrichedLeaderboard = leaderboard.map(entry => ({
          ...entry,
          number: Math.floor(Math.random() * 100), // Placeholder driver number
          shortName: "DRV", // Placeholder short name
          name: "Driver Name", // Placeholder name
          uri: entry.uri
      }));

      res.status(200).json({
          lap: lapNumber,
          entrants: enrichedLeaderboard
      });
  });
};

// GET /race/:id/leaderboard - Get latest leaderboard for the race
exports.getRaceLeaderboard = (req, res) => {
  const raceId = parseInt(req.params.id);

  Race.getRaceLeaderboard(raceId, (err, leaderboardData) => {
      if (err) {
          return res.status(400).json({ message: err.message });
      }

      // Mocked driver info for each entrant (replace this with actual driver details from the car URIs in a real scenario)
      const enrichedLeaderboard = leaderboardData.entrants.map(entry => ({
          ...entry,
          number: Math.floor(Math.random() * 100), // Placeholder driver number
          shortName: "DRV", // Placeholder short name
          name: "Driver Name", // Placeholder name
          uri: entry.uri
      }));

      res.status(200).json({
          lap: leaderboardData.lap,
          entrants: enrichedLeaderboard
      });
  });
};

