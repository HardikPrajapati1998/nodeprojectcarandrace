const Track = require("../models/Track");

exports.getAllTracks = (req, res) => {
  const { team_short_name } = req.params; // Get team_short_name from params

  Track.getAllTracks(team_short_name, (err, tracks) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json({
      code: 200,
      result: tracks,
    });
  });
};

exports.getTrackById = (req, res) => {
  const { id } = req.params;
  const { team_short_name } = req.params; // Get team_short_name from params

  Track.getTrackById(id, team_short_name, (err, track) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!track) return res.status(404).json({ message: "Track not found" });
    res.json({
      code: 200,
      result: track,
    });
  });
};

exports.createTrack = (req, res) => {
  const { name, type, laps, baseLapTime } = req.body;
  const { team_short_name } = req.params; // Get team_short_name from params

  if (!name || !type || !laps || baseLapTime === undefined) {
    return res.status(400).json({ error: "All fields are required" });
  }
  Track.findTeamIdByShortName(team_short_name, (err, team_id) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (!team_id) return res.status(404).json({ message: "Team not found" });
    // You might want to fetch the team_id based on team_short_name here
    Track.createTrack(
      { name, type, laps, baseLapTime, team_id },
      (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({
          message: "Track added successfully",
          trackId: result.insertId,
        });
      }
    );
  });
};

exports.deleteTrack = (req, res) => {
  const { id } = req.params;
  const { team_short_name } = req.params; // Get team_short_name from params

  Track.deleteTrack(id, team_short_name, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Track not found" });
    res.json({ message: "Track deleted successfully" });
  });
};

/// Get all races for a specific track by track ID and team short name
exports.getRacesByTrackId = (req, res) => {
  const trackId = req.params.id;
  const teamShortName = req.params.team_short_name; // Capture team short name

  // Optional: If you need to use the team short name for filtering or validation, you can implement logic here.
  // This example assumes you may want to log or validate it but doesn't directly impact the races fetched.
  Track.findTeamIdByShortName(teamShortName, (err, team_id) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (!team_id) return res.status(404).json({ message: "Team not found" });
    Track.getRacesByTrackId(trackId, teamShortName, (err, results) => {
      if (err) return res.status(500).send(err);

      // Format the response
      const formattedRaces = results.map((race) => ({
        track: trackId, // Assuming this is the track ID
        id: race.id,
        entrants: JSON.parse(race.entrants || "[]"), // Parse JSON or return an empty array
        startingPositions: JSON.parse(race.starting_positions || "[]"), // Parse JSON or return an empty array
        laps: JSON.parse(race.laps || "[]").map((lap) => ({
          number: lap.number,
          lapTimes: lap.lap_times || [], // Ensure lapTimes defaults to an empty array
        })),
      }));

      res.json({
        code: 200,
        result: formattedRaces,
      });
    });
  });
};
// Create a new race for a specific track by track ID
exports.createRaceForTrack = (req, res) => {
  const trackId = req.params.id;
  const teamShortName = req.params.team_short_name;
  Track.findTeamIdByShortName(teamShortName, (err, team_id) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (!team_id) return res.status(404).json({ message: "Team not found" });

    Track.createRaceForTrack(trackId, (err, results) => {
      if (err) return res.status(500).send(err);

      res.status(201).json({
        code: 201,
        message: `New race added for track ID ${trackId}`,
        raceId: results.insertId,
      });
    });
  });
};
