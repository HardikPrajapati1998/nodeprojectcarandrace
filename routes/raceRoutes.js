// routes/raceRoutes.js
const express = require("express");
const router = express.Router();
const raceController = require("../controllers/raceController");

// Get all races
router.get("/:team_short_name/race", raceController.getAllRaces);

// Create a new race
router.post("/:team_short_name/race", raceController.createRace);

// Get race by ID
router.get("/:team_short_name/race/:id", raceController.getRaceById);

// Get all car URIs (entrants) by race ID
router.get("/:team_short_name/race/:id/entrant", raceController.getEntrantsByRaceId);

// Add an entrant to a race
router.post('/:team_short_name/race/:id/entrant', raceController.addEntrantToRace);

// Delete car entrant from the race
router.delete("/:team_short_name/race/:id/entrant", raceController.removeEntrant);

// Qualify cars and assign starting positions
router.post("/:team_short_name/race/:id/qualify", raceController.qualifyRace);

// GET /race/:id/lap - Get laps for a specific race
router.get('/:team_short_name/race/:id/lap', raceController.getRaceLaps);

// POST /race/:id/lap - Add a lap to a race
router.post('/:team_short_name/race/:id/lap', raceController.addRaceLap);

// GET /race/:id/lap/:number - Get leaderboard for a specific lap in the race
router.get('/:team_short_name/race/:id/lap/:number', raceController.getRaceLapLeaderboard);

// GET /race/:id/leaderboard - Get the latest leaderboard for a race
router.get('/:team_short_name/race/:id/leaderboard', raceController.getRaceLeaderboard);



module.exports = router;
