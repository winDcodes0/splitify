const mongoose = require("mongoose");

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");
  } 
  catch (error) {
    console.error("Error connecting to MongoDB:", error);
    // Exit process with failure so Docker can restart the container
    process.exit(1);
  }
}

module.exports = connectDB;