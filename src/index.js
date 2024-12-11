require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors({ origin: "http://localhost:3000" })); // Update as needed for production

// MongoDB Atlas connection
const mongoURI = process.env.MONGO_URI;

mongoose
  .connect(mongoURI, { serverSelectionTimeoutMS: 10000 })
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((err) => console.error("Error connecting to MongoDB Atlas:", err));

// Define Schema and Model
const counterSchema = new mongoose.Schema({
  name: { type: String, default: "visitorCounter" },
  count: { type: Number, default: 0 },
});

const Counter = mongoose.model("Counter", counterSchema);

// Initialize the counter if it doesn't exist
(async () => {
  try {
    const counter = await Counter.findOne({ name: "visitorCounter" });
    if (!counter) {
      await Counter.create({ name: "visitorCounter", count: 0 });
    }
  } catch (err) {
    console.error("Error initializing counter:", err);
  }
})();

// Get the current counter value
app.get("/counter", async (req, res) => {
  try {
    console.log("GET /counter hit");
    const counter = await Counter.findOne({ name: "visitorCounter" });
    res.status(200).json({ count: counter ? counter.count : 0 });
  } catch (error) {
    console.error("Error fetching the counter:", error);
    res.status(500).json({ error: "Error fetching the counter" });
  }
});

// Increment the counter
app.post("/counter", async (req, res) => {
  try {
    // console.log("POST /counter hit");
    const updatedCounter = await Counter.findOneAndUpdate(
      { name: "visitorCounter" },
      { $inc: { count: 1 } },
      { new: true, upsert: true }
    );
    // console.log("Updated counter:", updatedCounter);
    res.status(200).json({ count: updatedCounter.count });
  } catch (error) {
    // console.error("Error updating counter:", error);
    res.status(500).json({ error: "Error updating the counter" });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
