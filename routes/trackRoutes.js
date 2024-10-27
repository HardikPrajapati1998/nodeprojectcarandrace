const express = require('express');
const router = express.Router();
const trackController = require('../controllers/trackController');

// Get all tracks
router.get('/:team_short_name/track', trackController.getAllTracks);

// Get a track by ID
router.get('/:team_short_name/track/:id', trackController.getTrackById);

// Create a new track
router.post('/:team_short_name/track', trackController.createTrack);

// Delete a track by ID
router.delete('/:team_short_name/track/:id', trackController.deleteTrack);

// New route to get all races for a specific track and team short name
router.get('/:team_short_name/track/:id/races', trackController.getRacesByTrackId);

// New route to create a race for a specific track and team short name
router.post('/:team_short_name/track/:id/races', trackController.createRaceForTrack);

module.exports = router;
