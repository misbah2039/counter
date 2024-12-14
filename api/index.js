// require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");

const app = express();
app.use(express.json());
app.use(cors({ origin: "https://billandattendancestatus.netlify.app" }));

// Set CSP Headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        fontSrc: [
          "'self'",
          "https://counter-qqdw7jbxf-mohd-misbahuddins-projects.vercel.app",
        ],
        scriptSrc: ["'self'", "https://vercel.live"],
      },
    },
  })
);

// MongoDB connection
const mongoURI = process.env.MONGO_URI;

mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 30000,
  })
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((err) => {
    console.error("Error connecting to MongoDB Atlas:", err);
    process.exit(1);
  });

const counterSchema = new mongoose.Schema({
  name: { type: String, default: "visitorCounter" },
  count: { type: Number, default: 0 },
});
const Counter = mongoose.model("Counter", counterSchema);

// Initialize Counter
mongoose.connection.once("open", async () => {
  try {
    const counter = await Counter.findOne({ name: "visitorCounter" });
    if (!counter) await Counter.create({ name: "visitorCounter", count: 0 });
  } catch (err) {
    console.error("Error initializing counter:", err);
  }
});

// Routes
app.get("/", (req, res) => res.status(200).send("Welcome to the Counter API!"));
app.get("/counter", async (req, res) => {
  console.log("inside get counter");
  try {
    const counter = await Counter.findOne({ name: "visitorCounter" });
    res.status(200).json({ count: counter ? counter.count : 0 });
  } catch (error) {
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Server is running on http://localhost:${PORT}`)
);
