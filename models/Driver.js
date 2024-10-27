const db = require("../config/db");

const Driver = {
  getAllDrivers: (team_short_name, callback) => {
    const sql = `
      SELECT drivers.*
      FROM drivers
      JOIN teams ON drivers.team_id = teams.id
      WHERE teams.short_name = ?
    `;
    db.query(sql, [team_short_name], (err, results) => {
      if (err) return callback(err);
      const formattedResults = results.map((driver) => ({
        number: driver.number,
        shortName: driver.short_name,
        name: driver.name,
        skill: {
          race: driver.skill_race,
          street: driver.skill_street,
        },
      }));
      callback(null, formattedResults);
    });
  },

  getDriverByNumber: (team_short_name, number, callback) => {
    const sql = `
    SELECT drivers.*
    FROM drivers
    JOIN teams ON drivers.team_id = teams.id
    WHERE teams.short_name = ? AND drivers.number = ?
  `;

    db.query(sql, [team_short_name, number], (err, results) => {
      if (err) return callback(err);

      const formattedResults = results.map((driver) => ({
        number: driver.number,
        shortName: driver.short_name,
        name: driver.name,
        skill: {
          race: driver.skill_race,
          street: driver.skill_street,
        },
      }));

      callback(null, formattedResults);
    });
  },

  addDriver: (driverData, team_id, callback) => {
    const sql = `
      INSERT INTO drivers (number, name, short_name, skill_race, skill_street, team_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    db.query(
      sql,
      [
        driverData.number,
        driverData.name,
        driverData.short_name,
        driverData.skill_race,
        driverData.skill_street,
        team_id,
      ],
      (err) => {
        if (err) return callback(err);
        callback(null);
      }
    );
  },

  updateDriver: (driver_number, driverData, callback) => {
    const sql = `
      UPDATE drivers
      SET name = ?, short_name = ?, skill_race = ?, skill_street = ?
      WHERE number = ?
    `;
    db.query(
      sql,
      [
        driverData.name,
        driverData.short_name,
        driverData.skill_race,
        driverData.skill_street,
        driver_number,
      ],
      (err, result) => {
        if (err) return callback(err);
        callback(null, result);
      }
    );
  },

  deleteDriver: (driver_number, callback) => {
    const sql = "DELETE FROM drivers WHERE number = ?";
    db.query(sql, [driver_number], (err, result) => {
      if (err) return callback(err);
      callback(null, result);
    });
  },

  findTeamIdByShortName: (team_short_name, callback) => {
    const sql = "SELECT id FROM teams WHERE short_name = ?";
    db.query(sql, [team_short_name], (err, results) => {
      if (err) return callback(err);
      callback(null, results.length ? results[0].id : null);
    });
  },
};

module.exports = Driver;
