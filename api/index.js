// require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors({ origin: "http://localhost:3000" }));

// MongoDB connection
const mongoURI = process.env.MONGO_URI;

mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 30000, // Increase timeout
    socketTimeoutMS: 45000,
  })
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((err) => {
    console.error("Error connecting to MongoDB Atlas:", err);
    process.exit(1);
  });

mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});

// Schema and Model
const counterSchema = new mongoose.Schema({
  name: { type: String, default: "visitorCounter" },
  count: { type: Number, default: 0 },
});
const Counter = mongoose.model("Counter", counterSchema);

// Initialize counter
async function initializeCounter() {
  try {
    const counter = await Counter.findOne({ name: "visitorCounter" });
    if (!counter) {
      await Counter.create({ name: "visitorCounter", count: 0 });
      console.log("Initialized counter");
    }
  } catch (err) {
    console.error("Error initializing counter:", err);
  }
}
mongoose.connection.once("open", initializeCounter);

// Routes
app.get("/counter", async (req, res) => {
  console.log("inside get counter");
  try {
    const counter = await Counter.findOne({ name: "visitorCounter" });
    res.status(200).json({ count: counter ? counter.count : 0 });
  } catch (error) {
    console.error("Error fetching the counter:", error);
    res.status(500).json({ error: "Error fetching the counter" });
  }
});

app.post("/counter", async (req, res) => {
  console.log("inside post counter");
  try {
    const updatedCounter = await Counter.findOneAndUpdate(
      { name: "visitorCounter" },
      { $inc: { count: 1 } },
      { new: true, upsert: true }
    );
    res.status(200).json({ count: updatedCounter.count });
  } catch (error) {
    res.status(500).json({ error: "Error updating the counter" });
  }
});

// Export app for Vercel
module.exports = app;
