const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const app = express();

const connectDB = require("./config/db");

const authRoutes = require('./routes/authRoutes')
const groupRoutes = require('./routes/groupRoutes')
const expenseRoutes = require('./routes/expenseRoutes')

app.use(cors({
  origin: "http://localhost:4200",
  credentials: true
}));
app.use(express.json()); // midleware

app.use("/api/auth", authRoutes); // auth routes
app.use("/api/groups", groupRoutes); // group routes
app.use("/api/expense", expenseRoutes); // expense routes

//--------------------------------------------------------------------------------

connectDB(); // Connect to MongoDB

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});