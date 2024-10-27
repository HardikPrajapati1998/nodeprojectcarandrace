const Driver = require("../models/Driver");

exports.getAllDrivers = (req, res) => {
  const { team_short_name } = req.params;
  Driver.getAllDrivers(team_short_name, (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!results.length) return res.status(404).json({ message: 'No drivers found for this team' });
    res.status(200).json(results);
  });
};

exports.getDriverByNumber = (req, res) => {
  const { number } = req.params;
  const { team_short_name } = req.params;
 
  Driver.getDriverByNumber(team_short_name,number, (err, driver) => {
    if (err) return res.status(500).json({ error: 'An error occurred while fetching the driver' });
    if (!driver) return res.status(404).json({ message: 'No drivers found for this team' });

    res.status(200).json(driver);
  });
};

exports.createDriver = (req, res) => {
  const { team_short_name } = req.params;
  const driverData = req.body;
  Driver.findTeamIdByShortName(team_short_name, (err, team_id) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!team_id) return res.status(404).json({ message: 'Team not found' });

    Driver.addDriver(driverData, team_id, (err) => {
      if (err) return res.status(500).json({ error: 'Failed to add driver' });
      res.status(201).json({ message: 'Driver added successfully' });
    });
  });
};

exports.updateDriver = (req, res) => {
  const { driver_number } = req.params;
  const driverData = req.body;

  Driver.updateDriver(driver_number, driverData, (err, result) => {
    if (err) return res.status(500).json({ error: 'Failed to update driver' });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Driver not found' });
    res.status(200).json({ message: 'Driver updated successfully' });
  });
};

exports.deleteDriver = (req, res) => {
  const { driver_number } = req.params;

  Driver.deleteDriver(driver_number, (err, result) => {
    if (err) return res.status(500).json({ error: 'Failed to delete driver' });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Driver not found' });
    res.status(200).json({ message: 'Driver deleted successfully' });
  });
};
