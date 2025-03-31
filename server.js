require("dotenv").config();
const express = require("express");
const cors = require("cors");
const logger = require("./utils/logger");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(logger.requestLogger);

// Routes
const songRoutes = require("./routes/songRoutes");
const streamRoutes = require("./routes/streamRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");

app.use("/songs", songRoutes);
app.use("/stream", streamRoutes);
app.use("/analytics", analyticsRoutes);

// Error handling
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
