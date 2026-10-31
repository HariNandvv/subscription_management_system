const express = require("express");
const authRoutes = require("./routes/authRoutes");
const cors = require("cors");
require("dotenv").config();

require("./config/db");



const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("SubFlow API is running!");
});

app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});