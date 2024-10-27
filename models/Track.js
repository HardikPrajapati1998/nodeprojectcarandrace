const db = require("../config/db");

const Track = {
  // Get all tracks for a specific team
  getAllTracks: (team_short_name, callback) => {
    const query = `
      SELECT tracks.id,tracks.name,tracks.type,tracks.laps,tracks.baseLapTime
      FROM tracks 
      JOIN teams ON tracks.team_id = teams.id 
      WHERE teams.short_name = ?`;

    db.query(query, [team_short_name], (err, results) => {
      callback(err, results);
    });
  },

  // Get a track by ID for a specific team
  getTrackById: (id, team_short_name, callback) => {
    const query = `
      SELECT tracks.id,tracks.name,tracks.type,tracks.laps,tracks.baseLapTime
      FROM tracks 
      JOIN teams ON tracks.team_id = teams.id 
      WHERE tracks.id = ? AND teams.short_name = ?`;

    db.query(query, [id, team_short_name], (err, results) => {
      callback(err, results[0]); // Return the first result
    });
  },

  // Create a new track for a specific team
  createTrack: (data, callback) => {
    const query =
      "INSERT INTO tracks (name, type, laps, baseLapTime, team_id) VALUES (?, ?, ?, ?, ?)";

    // Assuming you need to find the team_id based on team_short_name
    // You may need to implement a function to fetch the team_id
    // For this example, we'll just pass null for team_id
    db.query(
      query,
      [data.name, data.type, data.laps, data.baseLapTime, data.team_id],
      (err, result) => {
        callback(err, result);
      }
    );
  },

  // Delete a track by ID
  deleteTrack: (id, team_short_name, callback) => {
    const query =
      "DELETE FROM tracks WHERE id = ? AND team_id = (SELECT id FROM teams WHERE short_name = ?)";
    db.query(query, [id, team_short_name], (err, result) => {
      callback(err, result);
    });
  },

  getRacesByTrackId: (trackId, team_short_name, callback) => {
    const query = `
    SELECT r.*
    FROM races r
    JOIN tracks t ON r.track_id = t.id
    JOIN teams te ON t.team_id = te.id 
    WHERE r.track_id = ? AND te.short_name = ?`;

    db.query(query, [trackId, team_short_name], (err, results) => {
      if (err) {
        // Handle MySQL errors
        return callback(err);
      }
      // Return results through the callback
      callback(null, results);
    });
  },

  createRaceForTrack: (trackId, callback) => {
    const query = `INSERT INTO races (track_id, entrants, starting_positions) VALUES (?, ?, ?)`;
    db.query(
      query,
      [trackId, JSON.stringify([]), JSON.stringify([])],
      callback
    );
  },

  findTeamIdByShortName: (team_short_name, callback) => {
    const sql = "SELECT id FROM teams WHERE short_name = ?";
    db.query(sql, [team_short_name], (err, results) => {
      if (err) return callback(err);
      callback(null, results.length ? results[0].id : null);
    });
  },
};

module.exports = Track;
