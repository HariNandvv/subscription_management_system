const db = require("./config/db");
const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const planRoutes = require("./routes/planRoutes");
const subscriptionRoutes = require("./routes/subscriptionRoutes");
const userRoutes = require("./routes/userRoutes");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());



app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

app.get("/", (req, res) => {
    res.send("SubFlow API is running!");
});

const PORT = process.env.PORT || 5000;

app.use("/api/products", productRoutes);
app.use("/api/plans", planRoutes);
app.use("/api/subscriptions", subscriptionRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});