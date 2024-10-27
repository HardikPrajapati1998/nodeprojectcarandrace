const express = require("express");
const bodyParser = require("body-parser");
const driverRoutes = require("./routes/driverRoutes");
const carRoutes = require("./routes/carRoutes");
const trackRoutes = require("./routes/trackRoutes");
const raceRoutes = require("./routes/raceRoutes");

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());

// Use the routes VM 3
app.use("/teams-api", driverRoutes);
app.use("/teams-api", carRoutes);

// Use the routes VM 2
app.use("/timing-api", trackRoutes);
app.use("/timing-api", raceRoutes);

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
