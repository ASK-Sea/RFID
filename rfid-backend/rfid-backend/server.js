require("dotenv").config(); // load .env
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const routes = require("./routes"); // adjust if your routes path is different

const app = express();

// Middleware
app.use(cors({ origin: "http://localhost:5173" })); // frontend port
app.use(bodyParser.json());

// Mount all routes at /api
app.use("/api", routes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
